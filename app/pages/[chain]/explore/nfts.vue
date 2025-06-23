<script setup lang="ts">
import { CHAINS } from '@kodadot1/static'

// Validate chain parameter
definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && chain in CHAINS
  },
})

const sortOptions = [
  { label: 'Recent', value: 'blockNumber_DESC' },
  { label: 'Oldest', value: 'blockNumber_ASC' },
  { label: 'A-Z', value: 'name_ASC' },
  { label: 'Z-A', value: 'name_DESC' },
]

// SEO Meta
useSeoMeta({
  title: 'Explore NFTs - Discover Digital Collectibles',
  description: 'Browse and discover NFTs across different categories and collections.',
})

const route = useRoute()
const router = useRouter()

const queryState = computed({
  get: () => ({
    sort: sortOptions.find(opt => opt.value === route.query.sort) || sortOptions[0],
    search: route.query.search as string || '',
  }),
  set: ({ sort, search }: { sort?: typeof sortOptions[0], search?: string }) => {
    const query = { ...route.query }

    // Clean up default values
    if (sort?.value === 'blockNumber_DESC')
      delete query.sort
    else if (sort)
      query.sort = sort.value

    if (!search)
      delete query.search
    else query.search = search

    router.push({ query })
  },
})

const queryVariables = computed(() => {
  const orderBy = queryState.value.sort?.value || 'blockNumber_DESC'
  const search = queryState.value.search

  return {
    orderBy: [orderBy],
    ...(search && { name: search }),
  }
})
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <ExploreHeader>
      <template #controls>
        <UInput
          :model-value="queryState.search"
          placeholder="Search NFTs..."
          class="w-48"
          icon="i-heroicons-magnifying-glass"
          @update:model-value="queryState = { ...queryState, search: $event }"
        />
        <USelectMenu
          :model-value="queryState.sort"
          :items="sortOptions"
          placeholder="Sort By"
          class="w-32"
          @update:model-value="queryState = { ...queryState, sort: $event }"
        />
      </template>
    </ExploreHeader>

    <!-- Grid Content for NFTs -->
    <div class="mt-8">
      <NftsGrid
        :key="queryVariables.orderBy + (queryVariables.name || '')"
        :search="queryState.search"
        :variables="queryVariables"
      />
    </div>
  </UContainer>
</template>
