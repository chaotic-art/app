import type { ExploreFilterScope } from '~/stores/preferences'
import { hasQueryFilterValue } from '~/utils/query'

interface ExploreActiveFiltersState {
  hasPriceFilter: boolean
  hasLastSaleFilter: boolean
  hasRarityFilter: boolean
}

export function countExploreActiveFilters({
  hasPriceFilter,
  hasLastSaleFilter,
  hasRarityFilter,
}: ExploreActiveFiltersState): number {
  return Number(hasPriceFilter) + Number(hasLastSaleFilter) + Number(hasRarityFilter)
}

export function useExploreFilterToggleState(scope: ExploreFilterScope = 'explore') {
  const route = useRoute()
  const { exploreSidebarCollapsed } = storeToRefs(usePreferencesStore())
  const sidebarCollapsed = computed({
    get: () => exploreSidebarCollapsed.value[scope] ?? false,
    set: value => exploreSidebarCollapsed.value[scope] = value,
  })

  const activeFiltersCount = computed(() => {
    return countExploreActiveFilters({
      hasPriceFilter: hasQueryFilterValue(route.query.min_price) || hasQueryFilterValue(route.query.max_price),
      hasLastSaleFilter: hasQueryFilterValue(route.query.last_sale),
      hasRarityFilter: hasQueryFilterValue(route.query.min_rarity_percentile)
        || hasQueryFilterValue(route.query.max_rarity_percentile),
    })
  })

  function openFilters() {
    sidebarCollapsed.value = false
  }

  function closeFilters() {
    sidebarCollapsed.value = true
  }

  return {
    sidebarCollapsed,
    activeFiltersCount,
    openFilters,
    closeFilters,
  }
}
