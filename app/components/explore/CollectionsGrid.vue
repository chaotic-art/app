<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'

interface Props {
  variables?: Record<string, any>
  prefix?: AssetHubChain
}

const props = withDefaults(defineProps<Props>(), {
  variables: () => ({}),
  prefix: 'ahp',
})

const emit = defineEmits(['totalCountChange'])

// Use the collections infinite query composable
const {
  collections,
  totalCount,
  isInitialLoading,
  isLoading,
  hasMoreData,
  initialize,
} = useInfiniteCollections({
  pageSize: 40,
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
</script>

<template>
  <div class="space-y-8">
    <!-- Grid Content -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      <CollectionCard
        v-for="item in collections"
        :key="item.id"
        :item="item"
        :prefix="prefix"
        :is-loading="isInitialLoading && collections.length === 0"
      />
    </div>

    <!-- Loading More State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="flex items-center justify-center gap-2">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span class="text-gray-500">Loading more collections...</span>
      </div>
    </div>

    <!-- End of Results -->
    <div v-else-if="!hasMoreData && collections.length > 0" class="text-center py-8">
      <div class="text-gray-500">
        Showing all {{ totalCount }} collections
      </div>
    </div>

    <!-- Initial Loading State -->
    <div v-if="isInitialLoading && collections.length === 0" class="text-center py-8">
      <div class="text-gray-500">
        Loading collections...
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isInitialLoading && collections.length === 0" class="text-center py-16">
      <div class="text-gray-400 mb-4">
        <UIcon name="i-heroicons-photo" class="w-16 h-16 mx-auto" />
      </div>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">
        No collections found
      </h3>
      <p class="text-gray-500">
        Try adjusting your filters to see more results.
      </p>
    </div>
  </div>
</template>
