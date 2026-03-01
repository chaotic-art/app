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
  title: 'Explore NFTs - Discover Digital Collectibles',
  description: 'Browse and discover NFTs across different categories and collections.',
})

const { isLogIn } = useAuth()
const route = useRoute()
const { chain } = route.params as { chain: AssetHubChain }
const isMobileFiltersOpen = ref(false)
const { isMobileViewport } = useViewport()
const { viewMode: nftViewMode, gridClass: nftGridClass } = useNftViewMode('explore')

const queryVariables = ref<Record<string, any>>({})

const mergedQueryVariables = computed(() => {
  const filters: Record<string, any> = { ...queryVariables.value }

  const searchFilters = []

  if (filters.search) {
    if (Array.isArray(filters.search)) {
      searchFilters.push(...filters.search)
    }
    else {
      searchFilters.push(filters.search)
    }
  }

  const nftFilters = buildNftSearchFilters({ query: route.query })

  searchFilters.push(...nftFilters)

  if (searchFilters.length > 0) {
    filters.search = searchFilters
  }
  else {
    delete filters.search
  }

  return filters
})
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <ExploreHeader>
      <template #left-controls>
        <ExploreFilterToggleButton
          v-model:mobile-modal-open="isMobileFiltersOpen"
          filter-scope="explore"
        />
      </template>

      <template #controls="{ isFixed }">
        <NftsToolbar
          :has-owned-filter="isLogIn"
          :sticky-search-only="isFixed && isMobileViewport"
          @update:query-variables="queryVariables = $event"
        >
          <template #trailing>
            <div :class="isFixed && isMobileViewport ? 'max-md:order-first' : undefined">
              <NftViewModeSelector scope="explore" />
            </div>
          </template>
        </NftsToolbar>
      </template>
    </ExploreHeader>

    <!-- Grid Content for NFTs -->
    <ExploreFilters
      v-model:modal-open="isMobileFiltersOpen"
      class="my-8"
      filter-scope="explore"
      :show-mobile-trigger="false"
    >
      <NftsGrid
        :key="JSON.stringify(mergedQueryVariables)"
        :variables="mergedQueryVariables"
        :grid-class="nftGridClass"
        :view-mode="nftViewMode"
        :prefix="chain"
      />
    </ExploreFilters>
    <ScrollToTop />
  </UContainer>
</template>
