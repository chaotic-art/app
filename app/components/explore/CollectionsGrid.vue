<script setup lang="ts">
import { sanitizeIpfsUrl } from '~/utils/ipfs'

interface Props {
  pageSize?: number
  distance?: number
  variables?: Record<string, any>
  prefix?: string
}

const props = withDefaults(defineProps<Props>(), {
  variables: () => ({}),
  prefix: '',
})

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
})

onMounted(async () => {
  await initialize()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Grid Content -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      <NuxtLink
        v-for="item in collections"
        :key="item.id"
        class="border rounded-xl border-gray-300 overflow-hidden bg-white hover:shadow-lg transition-shadow"
        :to="`/${prefix}/collection/${item.id}`"
      >
        <!-- Collection Image -->
        <div class="aspect-square bg-gray-200 overflow-hidden">
          <img
            v-if="item.image && (!isInitialLoading || collections.length > 0)"
            :src="sanitizeIpfsUrl(item.image)"
            :alt="item.name"
            class="w-full h-full object-cover"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          >
          <div
            v-else
            class="w-full h-full flex items-center justify-center"
            :class="{ 'animate-pulse': isInitialLoading }"
          >
            <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-4 space-y-3">
          <!-- Collection Title -->
          <div v-if="!isInitialLoading || collections.length > 0" class="font-medium text-gray-900 truncate">
            {{ item.name }}
          </div>
          <div v-else class="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />

          <!-- Collection Owner Info -->
          <div v-if="(!isInitialLoading || collections.length > 0) && item.issuer" class="text-sm text-gray-600 truncate">
            By {{ item.issuer.slice(0, 6) }}...{{ item.issuer.slice(-4) }}
          </div>
          <div v-else-if="isInitialLoading && collections.length === 0" class="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
        </div>
      </NuxtLink>
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
