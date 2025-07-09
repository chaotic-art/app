<script setup lang="ts">
interface Props {
  search?: string
  variables?: Record<string, any>
  noItemsFoundMessage?: string
  gridClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variables: () => ({}),
  search: '',
  gridClass: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6',
  noItemsFoundMessage: 'Try adjusting your search or filters to see more results.',
})

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
  search: props.search,
  variables: props.variables,
})

onMounted(async () => {
  await initialize()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Grid Content -->
    <div :class="props.gridClass">
      <TokenCard
        v-for="nft in nfts"
        :key="nft.id"
        :token-id="nft.tokenId"
        :collection-id="nft.collectionId"
        :chain="nft.chain"
        :class="{ 'animate-pulse': nft.isPlaceholder }"
        :image="nft.image"
        :name="nft.name"
      />
    </div>

    <!-- Loading More State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="flex items-center justify-center gap-2">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span class="text-gray-500">Loading more NFTs...</span>
      </div>
    </div>

    <!-- End of Results -->
    <div v-else-if="!hasMoreData && nfts.length > 0" class="text-center py-8">
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
