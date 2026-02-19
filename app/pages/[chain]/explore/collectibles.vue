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

// SEO Meta
useSeoMeta({
  title: 'Gallery - Explore Collections and NFTs',
  description: 'Browse and discover collections and NFTs across different categories.',
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { sortOptions, defaultSortKey, normalizeSortKey, getSortDefinition } = useSortOptions('exploreCollections')

const { chain } = route.params as { chain: AssetHubChain }

const queryState = computed({
  get: () => ({
    sort: sortOptions.value.find(opt => opt.value === normalizeSortKey(route.query.sort)) || sortOptions.value[0],
    search: route.query.search as string || '',
  }),
  set: ({ sort, search }: { sort?: { label: string, value: string }, search?: string }) => {
    const query = { ...route.query }
    const sortKey = sort?.value ? normalizeSortKey(sort.value) : normalizeSortKey(route.query.sort)

    if (sortKey === defaultSortKey)
      delete query.sort
    else
      query.sort = sortKey

    if (!search)
      delete query.search
    else query.search = search

    router.push({ query })
  },
})

const queryVariables = computed(() => ({
  orderBy: getSortDefinition(queryState.value.sort?.value || defaultSortKey).orderBy,
  search: [
    {
      name_containsInsensitive: queryState.value.search,
    },
  ],
}))

const gridKey = computed(() => `${queryVariables.value.orderBy.join(',')}::${queryState.value.search}`)
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <ExploreHeader>
      <template #controls>
        <!-- Chain Switcher -->
        <ChainSwitcher />

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
          :placeholder="t('explore.sortBy')"
          class="w-40"
          :search-input="false"
          @update:model-value="queryState = { ...queryState, sort: $event }"
        />
      </template>
    </ExploreHeader>

    <!-- Grid Content -->
    <div class="my-8">
      <CollectionsGrid
        :key="gridKey"
        :variables="queryVariables"
        :prefix="chain"
      />
    </div>
    <ScrollToTop />
  </UContainer>
</template>
