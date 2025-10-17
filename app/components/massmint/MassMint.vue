<script setup lang="ts">
import type { NFT } from './types'
import { blockchains } from '~/composables/create/useCollectionForm'
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
// const descriptionLoaded = ref(false)
// const selectedCollection = ref<string | null>(null)
const { state, collections, collectionsLoading } = useMassMintForm()
const selectedCollection = computed(() => state.collection)
// Computed
const hasEnoughBalance = computed(() => {
  // TODO: Implement balance checking logic
  return true
})

const numOfValidNFTs = computed(() => (Object.values(NFTS.value) as NFT[]).length)

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
  // TODO: Implement review modal
  console.warn('Opening review modal')
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
      <UButton
        class="w-full max-w-md"
        size="lg"
        :disabled="!mediaLoaded || !hasEnoughBalance"
        @click="openReviewModal"
      >
        <span class="text-xl">
          {{ hasEnoughBalance ? 'Mint NFTs' : 'Not Enough Funds' }}
          <span
            v-if="numOfValidNFTs && !hasEnoughBalance"
            class="font-bold"
          >
            ({{ numOfValidNFTs }})
          </span>
        </span>
      </UButton>
    </div>
  </div>
</template>
