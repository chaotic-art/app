import { describe, expect, it } from 'vitest'
import { countExploreActiveFilters } from './useExploreFilterToggleState'

describe('countExploreActiveFilters', () => {
  it('returns zero when no filters are active', () => {
    expect(countExploreActiveFilters({
      hasStatusFilter: false,
      hasPriceFilter: false,
      hasLastSaleFilter: false,
      hasRarityFilter: false,
    })).toBe(0)
  })

  it('counts listed status as an active filter', () => {
    expect(countExploreActiveFilters({
      hasStatusFilter: true,
      hasPriceFilter: false,
      hasLastSaleFilter: false,
      hasRarityFilter: false,
    })).toBe(1)
  })

  it('counts unlisted status alongside other filters', () => {
    expect(countExploreActiveFilters({
      hasStatusFilter: true,
      hasPriceFilter: true,
      hasLastSaleFilter: false,
      hasRarityFilter: true,
    })).toBe(3)
  })
})
