import { hasQueryFilterValue, hasQueryTrueValue } from '~/utils/query'

interface ExploreActiveFiltersState {
  hasPriceFilter: boolean
  hasBelowFloorFilter: boolean
  hasLastSaleFilter: boolean
}

export function countExploreActiveFilters({
  hasPriceFilter,
  hasBelowFloorFilter,
  hasLastSaleFilter,
}: ExploreActiveFiltersState): number {
  return Number(hasPriceFilter) + Number(hasBelowFloorFilter) + Number(hasLastSaleFilter)
}

export function useExploreFilterToggleState() {
  const route = useRoute()
  const { exploreSidebarCollapsed: sidebarCollapsed } = storeToRefs(usePreferencesStore())

  const activeFiltersCount = computed(() => {
    return countExploreActiveFilters({
      hasPriceFilter: hasQueryFilterValue(route.query.min_price) || hasQueryFilterValue(route.query.max_price),
      hasBelowFloorFilter: hasQueryTrueValue(route.query.below_floor),
      hasLastSaleFilter: hasQueryFilterValue(route.query.last_sale),
    })
  })

  function openFilters() {
    sidebarCollapsed.value = false
  }

  return {
    sidebarCollapsed,
    activeFiltersCount,
    openFilters,
  }
}
