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

const listedOptions = [
  { label: 'All', value: '' },
  { label: 'Listed', value: 'true' },
  { label: 'Unlisted', value: 'false' },
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
    listed: listedOptions.find(opt => opt.value === route.query.listed) || listedOptions[0],
  }),
  set: ({ sort, search, listed }: { sort?: typeof sortOptions[0], search?: string, listed?: typeof listedOptions[0] }) => {
    const query = { ...route.query }

    // Clean up default values
    if (sort?.value === 'blockNumber_DESC')
      delete query.sort
    else if (sort)
      query.sort = sort.value

    if (!search)
      delete query.search
    else query.search = search

    if (listed?.value)
      query.listed = listed.value
    else
      delete query.listed

    router.push({ query })
  },
})

const queryVariables = computed(() => {
  const orderBy = queryState.value.sort?.value || 'blockNumber_DESC'
  const search = queryState.value.search
  const listedVariables
    = queryState.value.listed?.value === 'true'
      ? { search: { price_gt: 0 } }
      : queryState.value.listed?.value === 'false'
        ? { search: { price_isNull: true } }
        : {}

  return {
    orderBy: [orderBy],
    ...(search && { name: search }),
    ...listedVariables,
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

        <USelectMenu
          :model-value="queryState.listed"
          :items="listedOptions"
          placeholder="Listed"
          class="w-26"
          :search-input="false"
          @update:model-value="queryState = { ...queryState, listed: $event }"
        />
      </template>
    </ExploreHeader>

    <!-- Grid Content for NFTs -->
    <div class="mt-8">
      <NftsGrid
        :key="JSON.stringify(queryVariables)"
        :search="queryState.search"
        :variables="queryVariables"
      />
    </div>
  </UContainer>
</template>
