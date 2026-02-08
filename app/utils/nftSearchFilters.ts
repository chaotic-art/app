import type { LocationQuery } from 'vue-router'
import { parseQueryCsv, parseQueryNumber } from '~/utils/query'

export const RARITY_TIERS = {
  LEGENDARY: 'LEGENDARY',
  EPIC: 'EPIC',
  RARE: 'RARE',
  UNCOMMON: 'UNCOMMON',
  COMMON: 'COMMON',
} as const

export type RarityTier = typeof RARITY_TIERS[keyof typeof RARITY_TIERS]
export type RarityTierQueryValue = Lowercase<RarityTier>

const VALID_RARITY_TIERS = new Set<RarityTier>(Object.values(RARITY_TIERS))
export const RARITY_TIER_QUERY_VALUES = Object.values(RARITY_TIERS).map(
  tier => tier.toLowerCase() as RarityTierQueryValue,
)
const VALID_RARITY_TIER_QUERY_VALUES = new Set<RarityTierQueryValue>(RARITY_TIER_QUERY_VALUES)

function isRarityTier(value: string): value is RarityTier {
  return VALID_RARITY_TIERS.has(value as RarityTier)
}

export function isRarityTierQueryValue(value: string): value is RarityTierQueryValue {
  return VALID_RARITY_TIER_QUERY_VALUES.has(value as RarityTierQueryValue)
}

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

  const rarityTiers = parseQueryCsv(query.rarity_tier)
    .map(tier => tier.toLowerCase())
    .filter(isRarityTierQueryValue)
    .map(tier => tier.toUpperCase())
    .filter(isRarityTier)

  if (rarityTiers.length > 0) {
    searchFilters.push({ rarityTier_in: rarityTiers })
  }

  return searchFilters
}
