<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { NftViewMode } from '~/stores/preferences'
import type { NftRarity } from '~/types/rarity'

interface Props {
  variables?: Record<string, any>
  noItemsFoundMessage?: string
  gridClass?: string
  prefix?: AssetHubChain
  hideHoverAction?: boolean
  viewMode?: NftViewMode
  showRarity?: boolean
  rarityTotalItems?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  variables: () => ({}),
  gridClass: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6',
  noItemsFoundMessage: 'Try adjusting your search or filters to see more results.',
  viewMode: 'grid',
  showRarity: false,
  rarityTotalItems: null,
})

const emit = defineEmits(['totalCountChange'])
const { isMobileViewport } = useViewport()

// Use the NFTs infinite query composable
const {
  nfts,
  totalCount,
  isInitialLoading,
  isLoading,
  hasMoreData,
  initialize,
} = useInfiniteNfts({
  pageSize: 42,
  distance: 300,
  variables: props.variables,
  endpoint: props.prefix,
})

onMounted(async () => {
  await initialize()
})

watch(totalCount, (newCount) => {
  emit('totalCountChange', newCount)
})

function getRarity(nft: { rarity?: NftRarity | null }): NftRarity | null {
  if (!props.showRarity || !nft.rarity) {
    return null
  }

  return {
    ...nft.rarity,
    rarityTotalItems: props.rarityTotalItems,
  }
}

const hideMediaInfo = computed(() => props.viewMode === 'art')
const compactMediaInfo = computed(() => props.viewMode === 'compact' && isMobileViewport.value)
</script>

<template>
  <div class="space-y-8">
    <!-- Grid Content -->
    <div :class="props.gridClass">
      <template v-for="nft in nfts" :key="nft.isPlaceholder ? nft.id : `${prefix}-${nft.collectionId}-${nft.tokenId}-${nft.image}`">
        <div
          v-if="nft.isPlaceholder"
          class="relative border border-gray-300 dark:border-neutral-700 rounded-xl overflow-hidden"
        >
          <USkeleton class="aspect-square w-full rounded-none" />
          <div class="p-3 md:p-4 space-y-2">
            <USkeleton class="h-4 w-3/4 rounded" />
            <USkeleton class="h-3 w-1/2 rounded" />
          </div>
        </div>
        <TokenCard
          v-else
          :token-id="nft.tokenId"
          :collection-id="nft.collectionId"
          :chain="nft.chain"
          :image="nft.image"
          :name="nft.name"
          :price="nft.price"
          :current-owner="nft.currentOwner"
          :hide-hover-action="hideHoverAction"
          :hide-media-info="hideMediaInfo"
          :compact-media-info="compactMediaInfo"
          :show-rarity="showRarity"
          :rarity="getRarity(nft)"
        />
      </template>

      <slot name="additional-item" />
    </div>

    <!-- Loading More State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="flex items-center justify-center gap-2">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span class="text-gray-500">Loading more NFTs...</span>
      </div>
    </div>

    <!-- End of Results -->
    <div v-else-if="!hasMoreData && nfts.length > 0 && nfts.length === totalCount" class="text-center py-8">
      <div class="text-gray-500">
        Showing all {{ totalCount }} NFTs
      </div>
    </div>

    <!-- Initial Loading State -->
    <div v-if="isInitialLoading && nfts.length === 0" class="text-center py-8">
      <div class="text-gray-500">
        Loading NFTs...
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isInitialLoading && nfts.length === 0" class="text-center py-16">
      <div class="text-gray-400 mb-4">
        <UIcon name="i-heroicons-photo" class="w-16 h-16 mx-auto" />
      </div>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">
        No NFTs found
      </h3>
      <p class="text-gray-500">
        {{ noItemsFoundMessage }}
      </p>
    </div>
  </div>
</template>
