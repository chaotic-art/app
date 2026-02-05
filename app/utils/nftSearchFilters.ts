import type { LocationQuery } from 'vue-router'

export function buildNftSearchFilters({ query }: { query: LocationQuery }): Record<string, any>[] {
  const searchFilters: Record<string, any>[] = []

  const minPrice = query.min_price as string | undefined
  const maxPrice = query.max_price as string | undefined

  if (minPrice) {
    searchFilters.push({ price_gte: minPrice })
  }
  if (maxPrice) {
    searchFilters.push({ price_lte: maxPrice })
  }

  const lastSaleValue = query.last_sale as string | undefined
  if (lastSaleValue && lastSaleValue !== '') {
    if (lastSaleValue === 'all') {
      searchFilters.push({
        events_some: {
          interaction_eq: 'BUY',
        },
      })
    }
    else {
      const now = new Date()
      let hoursAgo = 0

      switch (lastSaleValue) {
        case '24h':
          hoursAgo = 24
          break
        case '7d':
          hoursAgo = 24 * 7
          break
        case '30d':
          hoursAgo = 24 * 30
          break
      }

      if (hoursAgo > 0) {
        const filterDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
        searchFilters.push({
          events_some: {
            AND: [
              { interaction_eq: 'BUY' },
              { timestamp_gte: filterDate.toISOString() },
            ],
          },
        })
      }
    }
  }

  return searchFilters
}
