<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { isAssetHubChain } from '~/utils/chain'
import { getSingleQueryValue } from '~/utils/query'

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
const {
  sortOptions,
  normalizeSortKeys,
  buildOrderBy,
  applySortQuery,
} = useSortOptions('exploreCollections')

const { chain } = route.params as { chain: AssetHubChain }

const queryState = computed({
  get: () => ({
    sortKeys: normalizeSortKeys(route.query.sort),
    search: getSingleQueryValue(route.query.search),
  }),
  set: ({ sortKeys, search }: { sortKeys?: string[], search?: string }) => {
    const query: LocationQueryRaw = { ...route.query }
    applySortQuery(query, sortKeys ?? route.query.sort)

    if (!search) {
      delete query.search
    }
    else {
      query.search = search
    }

    router.push({ query })
  },
})

const queryVariables = computed(() => ({
  orderBy: buildOrderBy(queryState.value.sortKeys),
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
          :model-value="queryState.sortKeys"
          :items="sortOptions"
          :placeholder="t('explore.sortBy')"
          class="w-40"
          :search-input="false"
          value-key="value"
          multiple
          @update:model-value="queryState = { ...queryState, sortKeys: normalizeSortKeys($event) }"
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
