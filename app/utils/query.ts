import type { LocationQuery, LocationQueryValue } from 'vue-router'

export const NFT_GRID_NON_FETCH_QUERY_KEYS = ['art_view'] as const

type QueryValue = LocationQueryValue | LocationQueryValue[] | null | undefined

export function parseQueryNumber(
  value: QueryValue,
): number | null {
  const normalized = Array.isArray(value) ? value[0] : value
  if (normalized === undefined || normalized === null || normalized === '') {
    return null
  }
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function getSingleQueryValue(value: QueryValue): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

function serializeQueryValue(
  value: LocationQueryValue | LocationQueryValue[] | null | undefined,
): string {
  if (Array.isArray(value)) {
    return value
      .map(item => (item === null ? '' : encodeURIComponent(item)))
      .join(',')
  }

  return value === undefined || value === null ? '' : encodeURIComponent(value)
}

export function serializeQueryForKey(
  query: LocationQuery,
  excludedKeys: Iterable<string> = [],
): string {
  const excluded = new Set(excludedKeys)

  return Object.entries(query)
    .filter(([key]) => !excluded.has(key))
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${encodeURIComponent(key)}=${serializeQueryValue(value)}`)
    .join('&')
}

export function hasQueryFilterValue(value: QueryValue): boolean {
  if (Array.isArray(value)) {
    return value.some(item => typeof item === 'string' && item.length > 0)
  }

  return typeof value === 'string' && value.length > 0
}

export function hasQueryTrueValue(value: QueryValue): boolean {
  if (Array.isArray(value)) {
    return value.includes('true')
  }

  return value === 'true'
}
