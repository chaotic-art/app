<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'

const props = defineProps<{
  collectionId: string
}>()

const route = useRoute()
const router = useRouter()
const {
  sortOptions,
  normalizeSortKeys,
  buildOrderBy,
  requiresListed,
  applySortQuery,
} = useSortOptions('collectionItems')

const selectedSortKeys = computed({
  get: () => normalizeSortKeys(route.query.sort),
  set: (value: string[]) => {
    const query: LocationQueryRaw = { ...route.query }
    applySortQuery(query, value)

    router.replace({ query })
  },
})

const queryVariables = computed(() => {
  const variables: Record<string, unknown> = {
    collections: [props.collectionId],
    orderBy: buildOrderBy(selectedSortKeys.value),
  }

  if (requiresListed(selectedSortKeys.value)) {
    variables.search = [
      { price_gt: '0' },
    ]
  }

  return variables
})
</script>

<template>
  <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-0">
    <p class="text-2xl md:text-3xl font-medium font-serif italic text-center md:text-left">
      Latest NFT Mints
    </p>

    <div class="w-full md:w-auto">
      <SortOptions
        v-model="selectedSortKeys"
        :options="sortOptions"
        class="w-40"
      />
    </div>
  </div>

  <LazyNftsGrid
    :key="`${selectedSortKeys.join(',')}::${collectionId}`"
    :variables="queryVariables"
    class="mt-6 md:mt-10"
    grid-class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
  />
</template>
