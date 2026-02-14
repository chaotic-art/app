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
