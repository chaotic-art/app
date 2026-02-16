<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { useItemSlideOver } from '~/composables/studio/useItemSlideOver'
import { useStudioCollection } from '~/composables/studio/useStudioCollection'
import { useStudioItems } from '~/composables/studio/useStudioItems'

const route = useRoute()
const router = useRouter()
const collection = useStudioCollection()

const isMock = computed(() => route.query.mock === 'true')
const chain = computed(() => route.params.chain as AssetHubChain)
const collectionId = computed(() => route.params.collection_id?.toString() ?? '')

const {
  selectionMode,
  selectedItemIds,
  selectedCount,
  searchQuery,
  toggleSelection,
  selectAll,
  clearSelection,
  toggleSelectionMode,
} = useStudioItems()

const { currentItemId, openItem, closeItem } = useItemSlideOver()

const mockNfts = computed(() => {
  if (!isMock.value)
    return []
  const names = [
    'Nebula Drift',
    'Solar Whisper',
    'Quantum Bloom',
    'Astral Echo',
    'Cosmic Seed',
    'Void Walker',
    'Star Forge',
    'Lunar Tide',
    'Photon Veil',
    'Dark Matter',
    'Celestial Shard',
    'Plasma Wave',
  ]
  return names.map((name, i) => ({
    tokenId: i + 1,
    collectionId: Number(collectionId.value),
    chain: chain.value,
    name: `${name} #${i + 1}`,
    price: i % 3 === 0 ? String((1.5 + i * 0.25) * 1e10) : null,
    currentOwner: collection.value.owner,
  }))
})

const filteredMockNfts = computed(() => {
  if (!searchQuery.value)
    return mockNfts.value
  const q = searchQuery.value.toLowerCase()
  return mockNfts.value.filter(n => n.name.toLowerCase().includes(q))
})

const hasItems = computed(() => isMock.value ? mockNfts.value.length > 0 : true)

const queryString = computed(() => {
  const q = new URLSearchParams(route.query as Record<string, string>).toString()
  return q ? `?${q}` : ''
})

const massMintLink = computed(() =>
  `/${route.params.chain}/studio/${route.params.collection_id}/massmint${queryString.value}`,
)

function handleSelectAll() {
  const ids = mockNfts.value.map(n => `${n.collectionId}-${n.tokenId}`)
  selectAll(ids)
}

function handleItemClick(tokenId: number, colId: number) {
  if (selectionMode.value) {
    toggleSelection(`${colId}-${tokenId}`)
  }
  else {
    openItem(`${colId}-${tokenId}`)
  }
}

function navigateToBulkOp(op: string) {
  router.push(`/${route.params.chain}/studio/${route.params.collection_id}/${op}${queryString.value}`)
}
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold">
          Items
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ collection.claimed }} items in collection
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <StudioEmptyState
      v-if="!hasItems"
      :mass-mint-link="massMintLink"
    />

    <!-- Items Content -->
    <template v-else>
      <!-- Toolbar -->
      <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div class="flex-1">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search items..."
            class="w-full md:max-w-xs"
          />
        </div>
        <div class="flex items-center gap-2">
          <UButton
            :variant="selectionMode ? 'solid' : 'outline'"
            size="sm"
            :icon="selectionMode ? 'i-heroicons-check-circle' : 'i-heroicons-cursor-arrow-ripple'"
            @click="toggleSelectionMode"
          >
            {{ selectionMode ? 'Done' : 'Select' }}
          </UButton>
          <UButton
            v-if="selectionMode"
            variant="outline"
            size="sm"
            @click="handleSelectAll"
          >
            Select All
          </UButton>
        </div>
      </div>

      <!-- Mock Items Grid -->
      <div
        v-if="isMock"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6"
      >
        <TokenCard
          v-for="nft in filteredMockNfts"
          :key="`mock-${nft.tokenId}`"
          :token-id="nft.tokenId"
          :collection-id="nft.collectionId"
          :chain="nft.chain"
          :name="nft.name"
          :price="nft.price"
          :current-owner="nft.currentOwner"
          :selection-mode="selectionMode"
          :is-selected="selectedItemIds.has(`${nft.collectionId}-${nft.tokenId}`)"
          :hide-hover-action="true"
          :studio-mode="true"
          @select="handleItemClick"
          @item-click="handleItemClick"
        />
      </div>

      <!-- Real Items Grid -->
      <div v-else class="text-center py-12 text-muted-foreground">
        <p>Connect your wallet to view real collection items.</p>
      </div>
    </template>

    <!-- Action Bar -->
    <StudioActionBar
      :selected-count="selectedCount"
      @clear="clearSelection"
      @airdrop="navigateToBulkOp('airdrop')"
      @list="navigateToBulkOp('list')"
      @transfer="navigateToBulkOp('transfer')"
    />

    <!-- Item Slide-Over -->
    <ItemSlideOver
      :item-id="currentItemId"
      :chain="chain"
      :collection-id="collectionId"
      @close="closeItem"
    />
  </div>
</template>
