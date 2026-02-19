export const SORT_OPTIONS = {
  exploreNfts: [
    { key: 'recent', labelKey: 'explore.sortRecentlyListed', orderBy: ['blockNumber_DESC', 'sn_DESC'], icon: 'i-heroicons-clock' },
    { key: 'oldest', labelKey: 'explore.sortOldest', orderBy: ['blockNumber_ASC', 'sn_ASC'], icon: 'i-heroicons-archive-box' },
    { key: 'price_low', labelKey: 'explore.sortPriceLowToHigh', orderBy: ['price_ASC'], requiresListed: true, icon: 'i-heroicons-arrow-trending-down' },
    { key: 'price_high', labelKey: 'explore.sortPriceHighToLow', orderBy: ['price_DESC'], requiresListed: true, icon: 'i-heroicons-arrow-trending-up' },
    { key: 'rarest', labelKey: 'explore.sortRarestFirst', orderBy: ['rarityPercentile_ASC_NULLS_LAST', 'rarityScore_DESC_NULLS_LAST', 'sn_ASC'], icon: 'i-heroicons-sparkles' },
    { key: 'common', labelKey: 'explore.sortCommonFirst', orderBy: ['rarityPercentile_DESC_NULLS_LAST', 'rarityScore_ASC_NULLS_LAST', 'sn_DESC'], icon: 'i-heroicons-squares-2x2' },
    { key: 'name_asc', labelKey: 'explore.sortNameAsc', orderBy: ['name_ASC'], icon: 'i-heroicons-arrow-up' },
    { key: 'name_desc', labelKey: 'explore.sortNameDesc', orderBy: ['name_DESC'], icon: 'i-heroicons-arrow-down' },
  ],
  collectionItems: [
    { key: 'recent', labelKey: 'explore.sortRecentlyListed', orderBy: ['blockNumber_DESC', 'sn_DESC'], icon: 'i-heroicons-clock' },
    { key: 'oldest', labelKey: 'explore.sortOldest', orderBy: ['blockNumber_ASC', 'sn_ASC'], icon: 'i-heroicons-archive-box' },
    { key: 'price_low', labelKey: 'explore.sortPriceLowToHigh', orderBy: ['price_ASC'], requiresListed: true, icon: 'i-heroicons-arrow-trending-down' },
    { key: 'price_high', labelKey: 'explore.sortPriceHighToLow', orderBy: ['price_DESC'], requiresListed: true, icon: 'i-heroicons-arrow-trending-up' },
    { key: 'rarest', labelKey: 'explore.sortRarestFirst', orderBy: ['rarityRank_ASC_NULLS_LAST', 'rarityScore_DESC_NULLS_LAST', 'sn_ASC'], icon: 'i-heroicons-sparkles' },
    { key: 'common', labelKey: 'explore.sortCommonFirst', orderBy: ['rarityRank_DESC_NULLS_LAST', 'rarityScore_ASC_NULLS_LAST', 'sn_DESC'], icon: 'i-heroicons-squares-2x2' },
  ],
  exploreCollections: [
    { key: 'recent', labelKey: 'explore.sortRecentlyListed', orderBy: ['blockNumber_DESC'], icon: 'i-heroicons-clock' },
    { key: 'oldest', labelKey: 'explore.sortOldest', orderBy: ['blockNumber_ASC'], icon: 'i-heroicons-archive-box' },
    { key: 'name_asc', labelKey: 'explore.sortNameAsc', orderBy: ['name_ASC'], icon: 'i-heroicons-arrow-up' },
    { key: 'name_desc', labelKey: 'explore.sortNameDesc', orderBy: ['name_DESC'], icon: 'i-heroicons-arrow-down' },
  ],
} as const

export type SortContext = keyof typeof SORT_OPTIONS
export type SortDefinition = ((typeof SORT_OPTIONS)[SortContext][number]) & {
  orderBy: readonly string[]
  requiresListed?: boolean
}
