<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { isAssetHubChain } from '~/utils/chain'

// Validate chain parameter
definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isAssetHubChain(chain)
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
  title: 'Gallery - Explore Collections and NFTs',
  description: 'Browse and discover collections and NFTs across different categories.',
})

const route = useRoute()
const router = useRouter()

const { chain } = route.params as { chain: AssetHubChain }

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

const queryVariables = computed(() => ({
  orderBy: queryState.value.sort?.value || 'blockNumber_DESC',
  search: [
    {
      name_containsInsensitive: queryState.value.search,
    },
  ],
}))
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <ExploreHeader>
      <template #controls>
        <UInput
          :model-value="queryState.search"
          placeholder="Search collections..."
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

    <!-- Grid Content -->
    <div class="my-8">
      <CollectionsGrid
        :key="queryVariables.orderBy + queryVariables.search[0]?.name_containsInsensitive"
        :variables="queryVariables"
        :prefix="chain"
      />
    </div>
  </UContainer>
</template>
