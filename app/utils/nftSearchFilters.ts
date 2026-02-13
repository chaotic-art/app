import type { LocationQuery } from 'vue-router'
import { parseQueryNumber } from '~/utils/query'

export function buildNftSearchFilters({ query }: { query: LocationQuery }): Record<string, any>[] {
  const searchFilters: Record<string, any>[] = []

  const minPriceValue = parseQueryNumber(query.min_price)
  const maxPriceValue = parseQueryNumber(query.max_price)

  if (minPriceValue !== null) {
    searchFilters.push({ price_gte: minPriceValue })
  }
  if (maxPriceValue !== null) {
    searchFilters.push({ price_lte: maxPriceValue })
  }

  const lastSaleValue = query.last_sale as string | undefined
  if (lastSaleValue && lastSaleValue !== '') {
    if (lastSaleValue === 'all') {
      searchFilters.push({
        events_some: {
          interaction_eq: 'BUY',
        },
      })
    }
    else {
      const now = new Date()
      let hoursAgo = 0

      switch (lastSaleValue) {
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

  const minRarityPercentile = parseQueryNumber(query.min_rarity_percentile)
  const maxRarityPercentile = parseQueryNumber(query.max_rarity_percentile)

  if (minRarityPercentile !== null) {
    searchFilters.push({ rarityPercentile_gte: minRarityPercentile })
  }

  if (maxRarityPercentile !== null) {
    searchFilters.push({ rarityPercentile_lte: maxRarityPercentile })
  }

  return searchFilters
}
