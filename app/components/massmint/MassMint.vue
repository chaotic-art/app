<script setup lang="ts">
import type { StepConfig } from '~/components/common/Stepper.vue'
import type { NFT, NFTToMint } from '~/components/massmint/types'
import type { TemplateFormat } from '~/components/massmint/utils'
import { LazyReviewMassMintModal } from '#components'
import { useQuery } from '@tanstack/vue-query'
import CommonStepper from '~/components/common/Stepper.vue'
import EditPanel from '~/components/massmint/EditPanel.vue'
import MassMintUploadStep from '~/components/massmint/MassMintUploadStep.vue'
import OverviewTable from '~/components/massmint/OverviewTable.vue'
import UploadDescription from '~/components/massmint/upload/UploadDescription.vue'
import { convertNftsToMap, generateTemplateContent } from '~/components/massmint/utils'
import { blockchains } from '~/composables/create/useCollectionForm'
import { useMassMint } from '~/composables/massmint/useMassMint'
import { useMassMintForm } from '~/composables/massmint/useMassMintForm'

// State
const NFTS = ref<{ [nftId: string]: NFT }>({})
const mediaLoaded = ref(false)
const isEditPanelOpen = ref(false)

const selectedNft = ref<NFT | undefined>(undefined)
const overlay = useOverlay()
const { accountId } = useAuth()
const { getBalance } = useBalances()
const reviewMassMintModal = overlay.create(LazyReviewMassMintModal)

// Form and minting composables
const { state, collections, collectionsLoading } = useMassMintForm()
const { massMint, progress, isLoading: isMinting } = useMassMint()
const { itemDeposit, metadataDeposit, attributeDeposit, existentialDeposit } = useDeposit(computed(() => state.blockchain))
const selectedCollection = computed(() => state.collection)
const selectedCollectionName = computed(() => collections.value.find(collection => collection.value === selectedCollection.value)?.name || '')

// Computed
const total = computed(() => {
  const totals = Object.values(NFTS.value).map((nft) => {
    const tx = itemDeposit.value // tmp add real tx calcualtion

    return ((nft.attributes?.length || 0) * attributeDeposit.value) + itemDeposit.value + metadataDeposit.value + tx
  })

  return totals.reduce((acc, curr) => acc + curr, 0)
})

const { data: balanceData } = useQuery({
  queryKey: ['wallet-balance', accountId, () => state.blockchain],
  queryFn: () => {
    return getBalance({
      address: accountId.value,
      prefix: state.blockchain,
    })
  },
})

const hasEnoughBalance = computed(() => (Number(balanceData?.value?.balance || 0) - existentialDeposit.value) > total.value)
const numOfValidNFTs = computed(() => (Object.values(NFTS.value) as NFT[]).length)

const numMissingNames = computed(() => {
  return (Object.values(NFTS.value) as NFT[]).filter(nft => !nft.name || nft.name.trim() === '').length
})
const numMissingDescriptions = computed(() => {
  return (Object.values(NFTS.value) as NFT[]).filter(nft => !nft.description || nft.description.trim() === '').length
})

const numMissingPrices = computed(() => {
  return (Object.values(NFTS.value) as NFT[]).filter(nft => nft.price === undefined || nft.price === 0).length
})

const itemDepositTotal = computed(() => itemDeposit.value * numOfValidNFTs.value)
const metadataDepositTotal = computed(() => metadataDeposit.value * numOfValidNFTs.value)
const attributeDepositTotal = computed(() =>
  (Object.values(NFTS.value) as NFT[]).reduce(
    (sum, nft) => sum + (nft.attributes?.length || 0) * attributeDeposit.value,
    0,
  ),
)

const estimatedCostOpen = ref(true)
const steps = [
  { id: 1, title: 'Collection', description: 'Choose chain and collection' },
  { id: 2, title: 'Upload', description: 'Upload media files' },
  { id: 3, title: 'Metadata', description: 'Prepare and upload metadata file' },
  { id: 4, title: 'Review', description: 'Check items and estimated cost' },
  { id: 5, title: 'Mint', description: 'Submit your mass mint transaction' },
] as const

const stepConfig: StepConfig[] = [
  { label: 'Collection', icon: 'i-heroicons-folder' },
  { label: 'Upload', icon: 'i-heroicons-arrow-up-tray' },
  { label: 'Metadata', icon: 'i-heroicons-document-text' },
  { label: 'Review', icon: 'i-heroicons-clipboard-document-list' },
  { label: 'Mint', icon: 'i-heroicons-sparkles' },
]

const currentStep = ref<number>(1)

const stepperCompletedSteps = computed(() =>
  Array.from({ length: Math.max(0, currentStep.value - 1) }, (_, i) => i),
)

const stepperMaxStepReached = computed(() => {
  let max = 0
  for (let i = 0; i < steps.length; i++) {
    if (canNavigateTo(i + 1))
      max = i
  }
  return max
})

const canGoToUploadStep = computed(() => !!selectedCollection.value)
const canGoToMetadataStep = computed(
  () => !!selectedCollection.value && mediaLoaded.value,
)
const canGoToReviewStep = computed(
  () => mediaLoaded.value && numOfValidNFTs.value > 0 && numMissingNames.value === 0,
)
const canGoToMintStep = computed(
  () => canGoToReviewStep.value && hasEnoughBalance.value,
)

function canNavigateTo(stepId: number) {
  if (stepId <= currentStep.value) {
    return true
  }

  if (stepId === 2) {
    return canGoToUploadStep.value
  }

  if (stepId === 3) {
    return canGoToMetadataStep.value
  }

  if (stepId === 4) {
    return canGoToReviewStep.value
  }

  if (stepId === 5) {
    return canGoToMintStep.value
  }

  return false
}

function goToStep(stepId: number) {
  if (stepId < 1 || stepId > steps.length) {
    return
  }

  if (!canNavigateTo(stepId)) {
    return
  }

  currentStep.value = stepId
}

function goNextStep() {
  goToStep(currentStep.value + 1)
}

function goPreviousStep() {
  goToStep(currentStep.value - 1)
}

function onStepperStepClick(stepIndex: number) {
  goToStep(stepIndex + 1)
}

function downloadMetadataTemplate(format: TemplateFormat) {
  const nfts = Object.values(NFTS.value) as NFT[]

  if (!nfts.length) {
    warningMessage('Upload art files first to generate a metadata template.')
    return
  }

  const content = generateTemplateContent(format, nfts)
  const mimeTypes: Record<TemplateFormat, string> = {
    json: 'application/json;charset=utf-8',
    csv: 'text/csv;charset=utf-8',
    txt: 'text/plain;charset=utf-8',
  }
  const extensions: Record<TemplateFormat, string> = {
    json: 'json',
    csv: 'csv',
    txt: 'txt',
  }
  const blob = new Blob([content], { type: mimeTypes[format] })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `massmint-template.${extensions[format]}`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

const templateDownloadItems = [
  { label: 'Download as JSON', icon: 'i-heroicons-document-text', onSelect: () => downloadMetadataTemplate('json') },
  { label: 'Download as CSV', icon: 'i-heroicons-table-cells', onSelect: () => downloadMetadataTemplate('csv') },
  { label: 'Download as TXT', icon: 'i-heroicons-document', onSelect: () => downloadMetadataTemplate('txt') },
]

function onMediaZipLoaded(data: { validFiles: NFT[], areAllFilesValid: boolean }) {
  NFTS.value = convertNftsToMap(data.validFiles) as { [nftId: string]: NFT }
  mediaLoaded.value = data.areAllFilesValid && data.validFiles.length > 0
}

function onDescriptionLoaded(entries: Record<string, any>) {
  const nftFileNameToId: Record<string, number> = (Object.values(NFTS.value) as NFT[]).reduce<Record<string, number>>(
    (acc, nft) => ({ ...acc, [nft.file.name]: nft.id }),
    {},
  )

  Object.values(entries).forEach((entry, idx) => {
    if (!entry.valid) {
      return
    }
    const nftId = nftFileNameToId[entry.file]
    if (!nftId) {
      return
    }

    const { file: _, ...restOfEntry } = entry
    NFTS.value[nftId] = {
      ...(NFTS.value[nftId] as NFT),
      ...restOfEntry,
      sortedIndex: idx,
    }
  })

  NFTS.value = convertNftsToMap(Object.values(NFTS.value) as NFT[]) as { [nftId: string]: NFT }
}

function openReviewModal() {
  if (numOfValidNFTs.value === 0) {
    warningMessage('No NFTs to mint')
    return
  }
  reviewMassMintModal.open({
    modelValue: true,
    numNfts: numOfValidNFTs.value,
    numMissingDescriptions: numMissingDescriptions.value,
    numMissingPrices: numMissingPrices.value,
    onClose: closeReviewModal,
    onMint: handleMint,
  })
}

function closeReviewModal() {
  reviewMassMintModal.close()
}

async function handleMint() {
  if (!selectedCollection.value) {
    errorMessage('No collection selected')
    return
  }

  closeReviewModal()

  // Convert NFTs to NFTToMint format
  const nftsToMint: NFTToMint[] = (Object.values(NFTS.value) as NFT[]).map(nft => ({
    name: nft.name || `NFT #${nft.id}`,
    file: nft.file,
    description: nft.description,
    price: nft.price,
    attributes: nft.attributes,
  }))

  try {
    await massMint({
      nfts: nftsToMint,
      collectionId: selectedCollection.value,
      collectionName: selectedCollectionName.value,
      blockchain: state.blockchain,
    })
  }
  catch (error) {
    console.error('Mass mint error:', error)
    errorMessage(`Failed to mint NFTs: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function openSideBarWith(nft: NFT) {
  selectedNft.value = nft
  isEditPanelOpen.value = true
}

function closeEditPanel() {
  isEditPanelOpen.value = false
  selectedNft.value = undefined
}

function saveEditedNft(nft: NFT) {
  // ensure reactive update by replacing the object reference
  const current = NFTS.value[nft.id]
  if (!current) {
    closeEditPanel()
    return
  }
  NFTS.value = {
    ...NFTS.value,
    [nft.id]: { ...(current as NFT), ...nft },
  }
  closeEditPanel()
}

function deleteNFT(nft?: NFT) {
  if (!nft) {
    return
  }

  successMessage(`NFT ${nft.name || ''} removed`)

  NFTS.value = (Object.values(NFTS.value) as NFT[])
    .filter((n: NFT) => n.id !== nft.id)
    .map((nft: NFT, i: number) => ({ ...nft, id: i + 1 }))
    .reduce((acc: { [id: string]: NFT }, nft: NFT) => ({ ...acc, [nft.id]: nft }), {})
}

// Shared description: applies only to items without an individual description
const sharedDescription = ref('')

function applySharedDescriptionToAll() {
  const text = sharedDescription.value?.trim()
  if (!text) {
    warningMessage('Enter a shared description first.')
    return
  }

  const nfts = Object.values(NFTS.value) as NFT[]
  if (nfts.length === 0) {
    return
  }

  const next: { [id: string]: NFT } = { ...NFTS.value }
  nfts.forEach((nft) => {
    next[nft.id] = { ...nft, description: text }
  })
  NFTS.value = next
  successMessage(`Applied shared description to ${nfts.length} item(s).`)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Stepper -->
    <section class="border border-border rounded-lg shadow-sm p-4">
      <CommonStepper
        :steps="stepConfig"
        :current-step="currentStep - 1"
        :completed-steps="stepperCompletedSteps"
        :max-step-reached="stepperMaxStepReached"
        @step-click="onStepperStepClick"
      />
    </section>

    <!-- Step 1: Collection -->
    <section
      v-if="currentStep === 1"
      class="border border-border rounded-lg shadow-sm"
    >
      <div class="space-y-4 p-6">
        <p class="mb-4 text-lg font-medium">
          Choose a chain and collection, then continue to upload your art files.
        </p>
        <div class="flex flex-col gap-4 md:flex-row md:items-center">
          <UFormField
            name="blockchain"
            label="Blockchain"
            required
            help="Choose the blockchain network of the collection"
          >
            <USelectMenu
              :model-value="state.blockchain"
              :items="blockchains"
              value-key="value"
              placeholder="Select a blockchain"
              class="w-full"
              @update:model-value="value => state.blockchain = value as typeof state.blockchain"
            />
          </UFormField>

          <UFormField
            name="collection"
            label="Collection"
            required
            help="Select the collection to mass mint"
          >
            <USelectMenu
              :key="collections.map((c: { value: string }) => c.value).join(',')"
              :model-value="state.collection"
              :items="collections"
              value-key="value"
              placeholder="Select a collection"
              :search-input="{ placeholder: 'Search collections...' }"
              :disabled="collectionsLoading"
              :loading="collectionsLoading"
              class="w-full"
              @update:model-value="value => state.collection = (value || '') as typeof state.collection"
            />
          </UFormField>
        </div>

        <div
          v-if="!collectionsLoading && state.blockchain && collections.length === 0"
          class="rounded-lg border border-border bg-muted/30 p-4"
        >
          <p class="mb-3 text-sm text-muted-foreground">
            No collections found on this chain. Create one first, then return here to mass mint.
          </p>
          <UButton
            to="/create/collection"
            size="sm"
          >
            Create collection
          </UButton>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-border px-6 py-4">
        <span class="text-sm text-muted-foreground">
          Step 1 of 5 · Select a chain and collection to continue.
        </span>
        <UButton
          size="sm"
          :disabled="!canGoToUploadStep"
          @click="goNextStep"
        >
          Next: Upload
        </UButton>
      </div>
    </section>

    <!-- Step 2: Upload media -->
    <MassMintUploadStep
      v-else-if="currentStep === 2"
      :selected-collection="state.collection || undefined"
      :nfts="NFTS"
      :media-loaded="mediaLoaded"
      :can-go-to-metadata-step="canGoToMetadataStep"
      @media-zip-loaded="onMediaZipLoaded"
      @media-zip-reordered="onMediaZipLoaded"
      @delete-nft="deleteNFT"
      @next="goNextStep"
    />

    <!-- Step 3: Metadata -->
    <section
      v-else-if="currentStep === 3"
      class="border border-border rounded-lg shadow-sm"
    >
      <div class="space-y-4 p-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="mb-1 text-lg font-semibold">
              Metadata
            </p>
            <p class="text-sm text-muted-foreground">
              Download an auto-generated template, edit it, then upload it here. The preview table below updates from the metadata file.
            </p>
          </div>
          <UDropdownMenu
            :items="templateDownloadItems"
            :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
          >
            <UButton
              variant="ghost"
              size="sm"
              icon="i-heroicons-arrow-down-tray"
              trailing-icon="i-heroicons-chevron-down-20-solid"
              :disabled="!mediaLoaded"
            >
              Download template
            </UButton>
          </UDropdownMenu>
        </div>
      </div>

      <UploadDescription
        :disabled="!mediaLoaded"
        @file-loaded="onDescriptionLoaded"
      />

      <OverviewTable
        :disabled="!mediaLoaded"
        :nfts="NFTS"
        :collection-id="selectedCollection || undefined"
        @open-side-bar-with="openSideBarWith"
        @delete="deleteNFT"
      />

      <!-- Shared description: applies to items without an individual description -->
      <div class="border-t border-border px-6 py-4 space-y-3">
        <p class="text-sm font-semibold">
          Shared Description
        </p>
        <div class="relative">
          <UTextarea
            v-model="sharedDescription"
            :rows="4"
            autoresize
            placeholder="Applies to all items without an individual description"
            class="w-full min-h-[100px]"
            :disabled="!mediaLoaded"
          />
        </div>
        <UButton
          variant="outline"
          size="sm"
          icon="i-heroicons-check"
          :disabled="!mediaLoaded || !sharedDescription?.trim() || numOfValidNFTs === 0"
          @click="applySharedDescriptionToAll"
        >
          Apply to All
        </UButton>
      </div>

      <EditPanel
        :open="isEditPanelOpen"
        :nft="selectedNft"
        @close="closeEditPanel"
        @save="saveEditedNft"
      />

      <div class="flex items-center justify-between border-t border-border px-6 py-4">
        <UButton
          variant="ghost"
          size="sm"
          @click="goPreviousStep"
        >
          Back
        </UButton>
        <div class="flex items-center gap-3">
          <span class="text-xs text-muted-foreground">
            {{ numOfValidNFTs }} items loaded
          </span>
          <UButton
            size="sm"
            :disabled="!canGoToReviewStep"
            @click="goNextStep"
          >
            Next: Review
          </UButton>
        </div>
      </div>
    </section>

    <!-- Step 4: Review -->
    <section
      v-else-if="currentStep === 4"
      class="border border-border rounded-lg shadow-sm"
    >
      <div class="space-y-6 p-6">
        <div class="space-y-2">
          <p class="text-lg font-semibold">
            Review your batch
          </p>
          <p class="text-sm text-muted-foreground">
            Check that all items have the correct names, descriptions, prices, and properties before minting.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-lg border border-border bg-muted/30 p-4">
            <div class="text-xs font-medium text-muted-foreground">
              Items
            </div>
            <div class="mt-2 text-2xl font-semibold">
              {{ numOfValidNFTs }}
            </div>
          </div>
          <div class="rounded-lg border border-border bg-muted/30 p-4">
            <div class="text-xs font-medium text-muted-foreground">
              Missing descriptions
            </div>
            <div class="mt-2 text-2xl font-semibold">
              {{ numMissingDescriptions }}
            </div>
          </div>
          <div class="rounded-lg border border-border bg-muted/30 p-4">
            <div class="text-xs font-medium text-muted-foreground">
              Missing prices
            </div>
            <div class="mt-2 text-2xl font-semibold">
              {{ numMissingPrices }}
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-muted-foreground">
            You can still edit individual items from the overview table in the previous step.
          </div>
          <UButton
            variant="outline"
            size="sm"
            @click="openReviewModal"
          >
            Open detailed review
          </UButton>
        </div>
        <div class="rounded-lg border border-border bg-muted/30">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/50"
            @click="estimatedCostOpen = !estimatedCostOpen"
          >
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-chevron-down"
                class="size-5 shrink-0 text-muted-foreground transition-transform"
                :class="{ '-rotate-90': !estimatedCostOpen }"
              />
              <span class="text-sm font-medium">
                Estimated Cost · {{ numOfValidNFTs }} items
              </span>
            </div>
            <div class="flex items-center gap-3">
              <Money :value="total" inline :chain="state.blockchain" />
              <span
                class="text-xs font-medium"
                :class="hasEnoughBalance ? 'text-emerald-500' : 'text-amber-500'"
              >
                {{ hasEnoughBalance ? 'Sufficient balance' : 'Not enough balance' }}
              </span>
            </div>
          </button>
          <div
            v-show="estimatedCostOpen"
            class="border-t border-border px-4 pb-4 pt-1"
          >
            <div class="space-y-2 pt-2">
              <div class="flex items-center justify-between gap-4 text-sm">
                <div class="flex flex-col">
                  <span class="font-medium">Item Deposit</span>
                  <span class="text-xs text-muted-foreground">
                    <Money :value="itemDeposit" inline :chain="state.blockchain" hide-unit /> × {{ numOfValidNFTs }}
                  </span>
                </div>
                <Money :value="itemDepositTotal" inline :chain="state.blockchain" />
              </div>
              <div class="flex items-center justify-between gap-4 text-sm">
                <div class="flex flex-col">
                  <span class="font-medium">Metadata Deposit</span>
                  <span class="text-xs text-muted-foreground">
                    <Money :value="metadataDeposit" inline :chain="state.blockchain" hide-unit /> × {{ numOfValidNFTs }}
                  </span>
                </div>
                <Money :value="metadataDepositTotal" inline :chain="state.blockchain" />
              </div>
              <div
                v-if="attributeDepositTotal > 0"
                class="flex items-center justify-between gap-4 text-sm"
              >
                <div class="flex flex-col">
                  <span class="font-medium">Attribute Deposit</span>
                  <span class="text-xs text-muted-foreground">
                    <Money :value="attributeDeposit" inline :chain="state.blockchain" hide-unit />× attributes
                  </span>
                </div>
                <Money :value="attributeDepositTotal" inline :chain="state.blockchain" />
              </div>
              <div class="flex items-center justify-between gap-4 border-t border-border pt-2 text-sm">
                <span class="font-semibold">Total Deposit</span>
                <Money :value="total" inline :chain="state.blockchain" class="font-semibold" />
              </div>
            </div>
            <p class="mt-3 text-xs text-muted-foreground">
              Deposits are refundable when items are burned. Network fees (~0.001 DOT) are charged separately per transaction.
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-border px-6 py-4">
        <UButton
          variant="ghost"
          size="sm"
          @click="goPreviousStep"
        >
          Back
        </UButton>
        <UButton
          size="sm"
          :disabled="!canGoToMintStep"
          @click="goNextStep"
        >
          Next: Mint
        </UButton>
      </div>
    </section>

    <!-- Step 5: Mint -->
    <section
      v-else-if="currentStep === 5"
      class="border border-border rounded-lg shadow-sm"
    >
      <div class="space-y-6 p-6">
        <div class="space-y-2">
          <p class="text-lg font-semibold">
            Mint your NFTs
          </p>
          <p class="text-sm text-muted-foreground">
            When you are ready, start the mass mint flow. You will be guided through a detailed review and transaction signing.
          </p>
        </div>

        <div class="flex flex-col items-center gap-4">
          <UButton
            class="w-full max-w-md"
            size="lg"
            :disabled="!mediaLoaded || !hasEnoughBalance || isMinting"
            :loading="isMinting"
            @click="openReviewModal"
          >
            <span class="text-xl">
              <template v-if="isMinting">
                {{ progress.message }}
              </template>
              <template v-else>
                {{ hasEnoughBalance ? 'Mint NFTs' : 'Not Enough Funds' }}
                <span
                  v-if="numOfValidNFTs && hasEnoughBalance"
                  class="font-bold"
                >
                  ({{ numOfValidNFTs }})
                </span>
              </template>
            </span>
          </UButton>

          <div v-if="mediaLoaded" class="flex w-full max-w-md flex-col gap-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">
                Est. Cost
              </span>
              <Money :value="total" inline :chain="state.blockchain" />
            </div>
            <p class="text-xs text-muted-foreground">
              You will confirm this transaction in your wallet. Deposits are returned when items are removed from the chain.
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-border px-6 py-4">
        <UButton
          variant="ghost"
          size="sm"
          @click="goPreviousStep"
        >
          Back
        </UButton>
        <span class="text-xs text-muted-foreground">
          Step 5 of 5
        </span>
      </div>
    </section>
  </div>
</template>
