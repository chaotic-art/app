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
