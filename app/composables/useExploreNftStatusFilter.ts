import type { LocationQueryRaw } from 'vue-router'
import type { ListedFilterMode } from './useSearchFilters'
import type { SortContext, SortQueryValue } from '~/utils/sort'
import { getSingleQueryValue } from '~/utils/query'

export function listedQueryValueToMode(
  listedQueryValue: string,
  forceListed = false,
): ListedFilterMode {
  if (forceListed || listedQueryValue === 'true') {
    return 'listed'
  }

  if (listedQueryValue === 'false') {
    return 'unlisted'
  }

  return 'all'
}

export function listedModeToQueryValue(mode: ListedFilterMode): string | undefined {
  if (mode === 'listed') {
    return 'true'
  }

  if (mode === 'unlisted') {
    return 'false'
  }

  return undefined
}

export function syncListedModeForSort(
  currentMode: ListedFilterMode,
  currentRequiresListed: boolean,
  nextRequiresListed: boolean,
): ListedFilterMode {
  if (nextRequiresListed) {
    return 'listed'
  }

  if (currentRequiresListed && !nextRequiresListed) {
    return 'all'
  }

  return currentMode
}

function getListedQueryValue(
  value: LocationQueryRaw['listed'],
): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

function withListedQuery(
  query: LocationQueryRaw,
  mode: ListedFilterMode,
): LocationQueryRaw {
  const listedQueryValue = listedModeToQueryValue(mode)

  if (listedQueryValue) {
    return {
      ...query,
      listed: listedQueryValue,
    }
  }

  const { listed: _listed, ...nextQuery } = query
  return nextQuery
}

export function useExploreNftStatusFilter(context: SortContext = 'exploreNfts') {
  const route = useRoute()
  const { normalizeSortKeys, requiresListed } = useSortOptions(context)

  const sortKeys = computed(() => normalizeSortKeys(route.query.sort))
  const sortRequiresListed = computed(() => requiresListed(sortKeys.value))

  const listedMode = computed<ListedFilterMode>(() =>
    listedQueryValueToMode(getSingleQueryValue(route.query.listed), sortRequiresListed.value),
  )

  const unlistedDisabled = computed(() => sortRequiresListed.value)

  function resolveListedForSort(
    query: LocationQueryRaw,
    currentSortKeys: SortQueryValue,
    nextSortKeys: SortQueryValue,
  ): LocationQueryRaw {
    const currentRequiresListed = requiresListed(currentSortKeys)
    const nextRequiresListed = requiresListed(nextSortKeys)
    const currentMode = listedQueryValueToMode(
      getListedQueryValue(query.listed),
      currentRequiresListed,
    )
    const nextMode = syncListedModeForSort(
      currentMode,
      currentRequiresListed,
      nextRequiresListed,
    )

    return withListedQuery(query, nextMode)
  }

  return {
    listedMode,
    unlistedDisabled,
    resolveListedForSort,
  }
}
