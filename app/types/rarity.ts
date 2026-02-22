import { unlimited } from '~/utils/math'

export const RarityTier = {
  LEGENDARY: 'LEGENDARY',
  EPIC: 'EPIC',
  RARE: 'RARE',
  UNCOMMON: 'UNCOMMON',
  COMMON: 'COMMON',
} as const

export type RarityTierValue = (typeof RarityTier)[keyof typeof RarityTier]

export interface NftRarity {
  rarityRank?: number | null
  rarityScore?: number | null
  rarityPercentile?: number | null
  rarityTier?: RarityTierValue | null
  rarityTotalItems?: number | null
}

const rarityTierSet = new Set<RarityTierValue>(Object.values(RarityTier))

export function isRarityTier(value: unknown): value is RarityTierValue {
  return typeof value === 'string' && rarityTierSet.has(value as RarityTierValue)
}

export function normalizeRarityTotalItems(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'bigint') {
    return null
  }

  if (unlimited(value)) {
    return null
  }

  const normalizedValue = Number(value)

  if (!Number.isFinite(normalizedValue) || normalizedValue <= 0) {
    return null
  }

  return Math.trunc(normalizedValue)
}
