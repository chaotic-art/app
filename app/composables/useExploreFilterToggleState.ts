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

export function useExploreFilterToggleState() {
  const route = useRoute()
  const { exploreSidebarCollapsed: sidebarCollapsed } = storeToRefs(usePreferencesStore())

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

  return {
    sidebarCollapsed,
    activeFiltersCount,
    openFilters,
  }
}
