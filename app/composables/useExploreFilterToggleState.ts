import { hasQueryFilterValue, hasQueryTrueValue } from '~/utils/query'

interface ExploreActiveFiltersState {
  hasPriceFilter: boolean
  hasBelowFloorFilter: boolean
  hasLastSaleFilter: boolean
  hasRarityTierFilter: boolean
}

export function countExploreActiveFilters({
  hasPriceFilter,
  hasBelowFloorFilter,
  hasLastSaleFilter,
  hasRarityTierFilter,
}: ExploreActiveFiltersState): number {
  return Number(hasPriceFilter) + Number(hasBelowFloorFilter) + Number(hasLastSaleFilter) + Number(hasRarityTierFilter)
}

export function useExploreFilterToggleState() {
  const route = useRoute()
  const { exploreSidebarCollapsed: sidebarCollapsed } = storeToRefs(usePreferencesStore())

  const activeFiltersCount = computed(() => {
    return countExploreActiveFilters({
      hasPriceFilter: hasQueryFilterValue(route.query.min_price) || hasQueryFilterValue(route.query.max_price),
      hasBelowFloorFilter: hasQueryTrueValue(route.query.below_floor),
      hasLastSaleFilter: hasQueryFilterValue(route.query.last_sale),
      hasRarityTierFilter: hasQueryFilterValue(route.query.rarity_tier),
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
