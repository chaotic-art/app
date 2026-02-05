import type { LocationQuery } from 'vue-router'

export function buildNftSearchFilters({ query }: { query: LocationQuery }): Record<string, any>[] {
  const searchFilters: Record<string, any>[] = []

  const normalizeQueryValue = (value: LocationQuery[keyof LocationQuery] | undefined) => (
    Array.isArray(value) ? value[0] : value
  )

  const toFiniteNumber = (value: LocationQuery[keyof LocationQuery] | undefined) => {
    if (value === undefined || value === null || value === '') {
      return null
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  const minPriceValue = toFiniteNumber(normalizeQueryValue(query.min_price))
  const maxPriceValue = toFiniteNumber(normalizeQueryValue(query.max_price))

  if (minPriceValue !== null) {
    searchFilters.push({ price_gte: minPriceValue })
  }
  if (maxPriceValue !== null) {
    searchFilters.push({ price_lte: maxPriceValue })
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
