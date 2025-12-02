<script setup lang="ts">
import type { NFT, NFTToMint } from './types'
import { LazyReviewMassMintModal } from '#components'
import { useQuery } from '@tanstack/vue-query'
import { blockchains } from '~/composables/create/useCollectionForm'
import { useMassMint } from '~/composables/massmint/useMassMint'
import { useMassMintForm } from '~/composables/massmint/useMassMintForm'
import EditPanel from './EditPanel.vue'
import OverviewTable from './OverviewTable.vue'
import UploadCompressedMedia from './upload/UploadCompressedMedia.vue'
import UploadDescription from './upload/UploadDescription.vue'

// Props and emits
const emit = defineEmits<{
  backToOnboarding: []
}>()

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

const numMissingDescriptions = computed(() => {
  return (Object.values(NFTS.value) as NFT[]).filter(nft => !nft.description || nft.description.trim() === '').length
})

const numMissingPrices = computed(() => {
  return (Object.values(NFTS.value) as NFT[]).filter(nft => nft.price === undefined || nft.price === 0).length
})

// Helper function
function convertNftsToMap(nfts: any[]) {
  return nfts.map((file, i) => ({ ...file, id: i + 1 }))
    .reduce((acc, nft) => ({ ...acc, [nft.id]: nft }), {})
}

// Methods
function onMediaZipLoaded(data: { validFiles: any[], areAllFilesValid: boolean }) {
  NFTS.value = convertNftsToMap(data.validFiles)
  mediaLoaded.value = true
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

  // sort the NFTS by sortedIndex
  const sortedNfts = (Object.values(NFTS.value) as NFT[]).sort((a: NFT, b: NFT) => (a.sortedIndex || 0) - (b.sortedIndex || 0))

  NFTS.value = convertNftsToMap(sortedNfts as any[])
}

function toOnboarding() {
  emit('backToOnboarding')
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
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex">
      <UButton
        class="max-lg:mb-8"
        variant="outline"
        icon="i-heroicons-arrow-left"
        @click="toOnboarding"
      >
        Back To Onboarding
      </UButton>
    </div>

    <!-- Main Content Section -->
    <section class="border border-border rounded-lg shadow-sm">
      <div class="space-y-4 p-6">
        <p class="mb-4 text-lg font-medium">
          Choose a collection to which you want to mint
        </p>
        <div class="flex gap-4 items-center">
          <UFormField
            name="blockchain"
            label="Blockchain"
            required
            help="Choose the blockchain network of the collection"
          >
            <USelectMenu
              v-model="state.blockchain"
              :items="blockchains"
              value-key="value"
              placeholder="Select a blockchain"
              class="w-full"
            />
          </UFormField>

          <UFormField
            name="collection"
            label="Collection"
            required
            help="Select the collection to mass mint"
          >
            <USelectMenu
              :key="collections.map((collection: { value: string }) => collection.value).join(',')"
              v-model="state.collection"
              :items="collections"
              value-key="value"
              placeholder="Select a collection"
              :search-input="{ placeholder: 'Search collections...' }"
              :disabled="collectionsLoading"
              :loading="collectionsLoading"
              class="w-full"
            />
          </UFormField>
        </div>
      </div>
      <UploadCompressedMedia
        :disabled="!selectedCollection"
        @zip-loaded="onMediaZipLoaded"
      />

      <!-- Upload Description File Section -->
      <UploadDescription
        :disabled="!mediaLoaded"
        @file-loaded="onDescriptionLoaded"
      />

      <!-- Overview Table Section -->
      <OverviewTable
        :disabled="!mediaLoaded"
        :nfts="NFTS"
        :collection-id="selectedCollection || undefined"
        @open-side-bar-with="openSideBarWith"
        @delete="deleteNFT"
      />
      <EditPanel
        :open="isEditPanelOpen"
        :nft="selectedNft"
        @close="closeEditPanel"
        @save="saveEditedNft"
      />
    </section>

    <!-- Action Button -->
    <div class="flex justify-center w-full pb-8">
      <div class="flex flex-col items-center flex-1 max-w-md gap-4">
        <UButton
          class="w-full"
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

        <div v-if="mediaLoaded" class="flex gap-2 w-full justify-between">
          <span class="text-gray-600 dark:text-gray-400">
            Est. Cost:
          </span>

          <Money :value="total" inline :chain="state.blockchain" />
        </div>
      </div>
    </div>
  </div>
</template>
