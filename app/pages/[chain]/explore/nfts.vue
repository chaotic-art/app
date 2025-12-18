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

  const minPrice = route.query.min_price as string | undefined
  const maxPrice = route.query.max_price as string | undefined

  if (minPrice) {
    searchFilters.push({ price_gte: minPrice })
  }
  if (maxPrice) {
    searchFilters.push({ price_lte: maxPrice })
  }

  const belowFloor = route.query.below_floor === 'true'
  if (belowFloor) {
    // TODO: floor price filter needs indexer change
  }

  const lastSale = route.query.last_sale as string | undefined
  if (lastSale && lastSale !== '') {
    if (lastSale === 'all') {
      searchFilters.push({
        events_some: {
          interaction_eq: 'BUY',
        },
      })
    }
    else {
      const now = new Date()
      let hoursAgo = 0

      switch (lastSale) {
        case '24h':
          hoursAgo = 24
          break
        case '7d':
          hoursAgo = 24 * 7
          break
        case '30d':
          hoursAgo = 24 * 30
          break
      }

      if (hoursAgo > 0) {
        const filterDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
        searchFilters.push({
          events_some: {
            AND: [
              { interaction_eq: 'BUY' },
              { timestamp_gte: filterDate.toISOString() },
            ],
          },
        })
      }
    }
  }

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
      <template #controls>
        <NftsToolbar
          :has-owned-filter="isLogIn"
          @update:query-variables="queryVariables = $event"
        />
      </template>
    </ExploreHeader>

    <!-- Grid Content for NFTs -->
    <ExploreFilters class="my-8">
      <NftsGrid
        :key="JSON.stringify(mergedQueryVariables)"
        :search="mergedQueryVariables.name || ''"
        :variables="mergedQueryVariables"
        :prefix="chain"
      />
    </ExploreFilters>
    <ScrollToTop />
  </UContainer>
</template>
