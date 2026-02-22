import type { LocationQueryRaw } from 'vue-router'
import type { SortContext, SortQueryValue } from '~/utils/sort'
import {
  buildOrderBy as buildOrderByForContext,
  dropImplicitDefaultSort as dropImplicitDefaultSortForContext,
  normalizeSortKeys as normalizeSortKeysForContext,
  requiresListed as requiresListedForContext,
  SORT_OPTIONS,
  sortKeysToQueryValue as sortKeysToQueryValueForContext,
} from '~/utils/sort'

interface SelectSortOption {
  label: string
  value: string
  icon?: string
}

export function useSortOptions(context: SortContext) {
  const { t } = useI18n()

  const sortDefinitions = SORT_OPTIONS[context]
  const defaultSortKey = sortDefinitions[0].key

  const sortOptions = computed<SelectSortOption[]>(() =>
    sortDefinitions.map(definition => ({
      label: t(definition.labelKey),
      value: definition.key,
      icon: definition.icon,
    })),
  )

  function normalizeSortKeys(value: SortQueryValue): string[] {
    return normalizeSortKeysForContext(context, value)
  }

  function buildOrderBy(selectedSortKeys: SortQueryValue): string[] {
    return buildOrderByForContext(context, selectedSortKeys)
  }

  function requiresListed(selectedSortKeys: SortQueryValue): boolean {
    return requiresListedForContext(context, selectedSortKeys)
  }

  function sortKeysToQueryValue(selectedSortKeys: SortQueryValue): string[] | string | undefined {
    return sortKeysToQueryValueForContext(normalizeSortKeys(selectedSortKeys), defaultSortKey)
  }

  function applySortQuery(query: LocationQueryRaw, selectedSortKeys: SortQueryValue): string[] {
    const existingSort = query.sort
    const hasExplicitSortInQuery = Array.isArray(existingSort)
      ? existingSort.some(sortValue => typeof sortValue === 'string' && sortValue.length > 0)
      : typeof existingSort === 'string' && existingSort.length > 0

    const normalizedSortKeys = normalizeSortKeys(selectedSortKeys)
    const nextSortKeys = dropImplicitDefaultSortForContext(
      normalizedSortKeys,
      defaultSortKey,
      hasExplicitSortInQuery,
    )
    const sortQueryValue = sortKeysToQueryValue(nextSortKeys)

    if (sortQueryValue === undefined) {
      delete query.sort
    }
    else {
      query.sort = sortQueryValue
    }

    return nextSortKeys
  }

  return {
    sortOptions,
    normalizeSortKeys,
    buildOrderBy,
    requiresListed,
    applySortQuery,
  }
}
