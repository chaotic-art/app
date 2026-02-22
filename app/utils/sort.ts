export type SortGroup = 'time' | 'price' | 'rarity' | 'name'
export type SortQueryValue = string | null | undefined | Array<string | null | undefined>

export interface SortDefinition {
  key: string
  labelKey: string
  group: SortGroup
  primaryOrderBy: readonly string[]
  tieBreakerOrderBy?: readonly string[]
  requiresListed?: boolean
  icon?: string
}

export const SORT_OPTIONS = {
  exploreNfts: [
    { key: 'recent', labelKey: 'explore.sortRecentlyListed', group: 'time', primaryOrderBy: ['blockNumber_DESC'], tieBreakerOrderBy: ['sn_DESC'], icon: 'i-heroicons-clock' },
    { key: 'oldest', labelKey: 'explore.sortOldest', group: 'time', primaryOrderBy: ['blockNumber_ASC'], tieBreakerOrderBy: ['sn_ASC'], icon: 'i-heroicons-archive-box' },
    { key: 'price_low', labelKey: 'explore.sortPriceLowToHigh', group: 'price', primaryOrderBy: ['price_ASC'], requiresListed: true, icon: 'i-heroicons-arrow-trending-down' },
    { key: 'price_high', labelKey: 'explore.sortPriceHighToLow', group: 'price', primaryOrderBy: ['price_DESC'], requiresListed: true, icon: 'i-heroicons-arrow-trending-up' },
    { key: 'rarest', labelKey: 'explore.sortRarestFirst', group: 'rarity', primaryOrderBy: ['rarityPercentile_ASC_NULLS_LAST'], tieBreakerOrderBy: ['rarityScore_DESC_NULLS_LAST', 'sn_ASC'], icon: 'i-heroicons-sparkles' },
    { key: 'common', labelKey: 'explore.sortCommonFirst', group: 'rarity', primaryOrderBy: ['rarityPercentile_DESC_NULLS_LAST'], tieBreakerOrderBy: ['rarityScore_ASC_NULLS_LAST', 'sn_DESC'], icon: 'i-heroicons-squares-2x2' },
    { key: 'name_asc', labelKey: 'explore.sortNameAsc', group: 'name', primaryOrderBy: ['name_ASC'], icon: 'i-heroicons-arrow-up' },
    { key: 'name_desc', labelKey: 'explore.sortNameDesc', group: 'name', primaryOrderBy: ['name_DESC'], icon: 'i-heroicons-arrow-down' },
  ],
  collectionItems: [
    { key: 'recent', labelKey: 'explore.sortRecentlyListed', group: 'time', primaryOrderBy: ['blockNumber_DESC'], tieBreakerOrderBy: ['sn_DESC'], icon: 'i-heroicons-clock' },
    { key: 'oldest', labelKey: 'explore.sortOldest', group: 'time', primaryOrderBy: ['blockNumber_ASC'], tieBreakerOrderBy: ['sn_ASC'], icon: 'i-heroicons-archive-box' },
    { key: 'price_low', labelKey: 'explore.sortPriceLowToHigh', group: 'price', primaryOrderBy: ['price_ASC'], requiresListed: true, icon: 'i-heroicons-arrow-trending-down' },
    { key: 'price_high', labelKey: 'explore.sortPriceHighToLow', group: 'price', primaryOrderBy: ['price_DESC'], requiresListed: true, icon: 'i-heroicons-arrow-trending-up' },
    { key: 'rarest', labelKey: 'explore.sortRarestFirst', group: 'rarity', primaryOrderBy: ['rarityRank_ASC_NULLS_LAST'], tieBreakerOrderBy: ['rarityScore_DESC_NULLS_LAST', 'sn_ASC'], icon: 'i-heroicons-sparkles' },
    { key: 'common', labelKey: 'explore.sortCommonFirst', group: 'rarity', primaryOrderBy: ['rarityRank_DESC_NULLS_LAST'], tieBreakerOrderBy: ['rarityScore_ASC_NULLS_LAST', 'sn_DESC'], icon: 'i-heroicons-squares-2x2' },
  ],
  exploreCollections: [
    { key: 'recent', labelKey: 'explore.sortRecentlyListed', group: 'time', primaryOrderBy: ['blockNumber_DESC'], icon: 'i-heroicons-clock' },
    { key: 'oldest', labelKey: 'explore.sortOldest', group: 'time', primaryOrderBy: ['blockNumber_ASC'], icon: 'i-heroicons-archive-box' },
    { key: 'name_asc', labelKey: 'explore.sortNameAsc', group: 'name', primaryOrderBy: ['name_ASC'], icon: 'i-heroicons-arrow-up' },
    { key: 'name_desc', labelKey: 'explore.sortNameDesc', group: 'name', primaryOrderBy: ['name_DESC'], icon: 'i-heroicons-arrow-down' },
  ],
} as const satisfies Record<string, readonly SortDefinition[]>

export type SortContext = keyof typeof SORT_OPTIONS

const ORDER_BY_PATTERN = /^(.*)_(?:ASC|DESC)(?:_NULLS_(?:FIRST|LAST))?$/

function getSortDefinitions(context: SortContext): readonly SortDefinition[] {
  return SORT_OPTIONS[context]
}

function getSortDefinitionMap(context: SortContext): Map<string, SortDefinition> {
  return new Map(getSortDefinitions(context).map(definition => [definition.key, definition]))
}

function getDefaultSortKey(context: SortContext): string {
  return getSortDefinitions(context)[0]?.key || ''
}

function splitSortEntry(entry: string): string[] {
  return entry
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function extractSortKeys(value: SortQueryValue): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap(item => (typeof item === 'string' ? splitSortEntry(item) : []))
  }

  if (typeof value === 'string') {
    return splitSortEntry(value)
  }

  return []
}

function getOrderByField(orderBy: string): string {
  const match = ORDER_BY_PATTERN.exec(orderBy)
  return match?.[1] || orderBy
}

function dedupeOrderBy(orderByValues: string[]): string[] {
  const seenFields = new Set<string>()
  const dedupedValues: string[] = []

  for (const orderByValue of orderByValues) {
    const field = getOrderByField(orderByValue)

    if (seenFields.has(field)) {
      continue
    }

    seenFields.add(field)
    dedupedValues.push(orderByValue)
  }

  return dedupedValues
}

export function normalizeSortKeys(context: SortContext, rawSortKeys: SortQueryValue): string[] {
  const defaultSortKey = getDefaultSortKey(context)
  const definitionByKey = getSortDefinitionMap(context)
  const extractedSortKeys = extractSortKeys(rawSortKeys)

  let normalizedSortKeys: string[] = []

  for (const sortKey of extractedSortKeys) {
    const definition = definitionByKey.get(sortKey)

    if (!definition) {
      continue
    }

    if (normalizedSortKeys.includes(sortKey)) {
      continue
    }

    normalizedSortKeys = normalizedSortKeys.filter((existingSortKey) => {
      const existingDefinition = definitionByKey.get(existingSortKey)
      return existingDefinition?.group !== definition.group
    })

    normalizedSortKeys.push(sortKey)
  }

  if (normalizedSortKeys.length === 0) {
    return defaultSortKey ? [defaultSortKey] : []
  }

  return normalizedSortKeys
}

export function toggleSortKey(context: SortContext, currentSortKeys: SortQueryValue, toggledSortKey: string): string[] {
  const definitionByKey = getSortDefinitionMap(context)
  const toggledDefinition = definitionByKey.get(toggledSortKey)

  if (!toggledDefinition) {
    return normalizeSortKeys(context, currentSortKeys)
  }

  const normalizedCurrentSortKeys = normalizeSortKeys(context, currentSortKeys)

  if (normalizedCurrentSortKeys.includes(toggledSortKey)) {
    const nextSortKeys = normalizedCurrentSortKeys.filter(sortKey => sortKey !== toggledSortKey)
    return nextSortKeys.length > 0 ? nextSortKeys : normalizeSortKeys(context, [])
  }

  const nextSortKeys = normalizedCurrentSortKeys
    .filter((sortKey) => {
      const definition = definitionByKey.get(sortKey)
      return definition?.group !== toggledDefinition.group
    })

  nextSortKeys.push(toggledSortKey)

  return nextSortKeys.length > 0 ? nextSortKeys : normalizeSortKeys(context, [])
}

export function buildOrderBy(context: SortContext, selectedSortKeys: SortQueryValue): string[] {
  const definitionByKey = getSortDefinitionMap(context)
  const normalizedSortKeys = normalizeSortKeys(context, selectedSortKeys)
  const primaryOrderByValues: string[] = []
  const tieBreakerOrderByValues: string[] = []

  for (const sortKey of normalizedSortKeys) {
    const definition = definitionByKey.get(sortKey)

    if (!definition) {
      continue
    }

    primaryOrderByValues.push(...definition.primaryOrderBy)

    if (definition.tieBreakerOrderBy?.length) {
      tieBreakerOrderByValues.push(...definition.tieBreakerOrderBy)
    }
  }

  return dedupeOrderBy([...primaryOrderByValues, ...tieBreakerOrderByValues])
}

export function requiresListed(context: SortContext, selectedSortKeys: SortQueryValue): boolean {
  const definitionByKey = getSortDefinitionMap(context)
  const normalizedSortKeys = normalizeSortKeys(context, selectedSortKeys)

  return normalizedSortKeys.some(sortKey => Boolean(definitionByKey.get(sortKey)?.requiresListed))
}

export function sortKeysToQueryValue(selectedSortKeys: string[], defaultSortKey: string): string[] | string | undefined {
  const normalizedUniqueSortKeys = selectedSortKeys
    .filter(sortKey => typeof sortKey === 'string' && sortKey.length > 0)
    .filter((sortKey, index, keys) => keys.indexOf(sortKey) === index)

  if (normalizedUniqueSortKeys.length === 0) {
    return undefined
  }

  if (normalizedUniqueSortKeys.length === 1 && normalizedUniqueSortKeys[0] === defaultSortKey) {
    return undefined
  }

  if (normalizedUniqueSortKeys.length === 1) {
    return normalizedUniqueSortKeys[0]
  }

  return normalizedUniqueSortKeys
}

export function dropImplicitDefaultSort(
  selectedSortKeys: string[],
  defaultSortKey: string,
  hasExplicitSortInQuery: boolean,
): string[] {
  if (hasExplicitSortInQuery) {
    return selectedSortKeys
  }

  if (selectedSortKeys.length <= 1) {
    return selectedSortKeys
  }

  if (!selectedSortKeys.includes(defaultSortKey)) {
    return selectedSortKeys
  }

  return selectedSortKeys.filter(sortKey => sortKey !== defaultSortKey)
}
