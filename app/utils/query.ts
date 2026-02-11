import type { LocationQuery, LocationQueryValue } from 'vue-router'

export const NFT_GRID_NON_FETCH_QUERY_KEYS = ['art_view'] as const

export function parseQueryNumber(
  value: LocationQueryValue | LocationQueryValue[] | null | undefined,
): number | null {
  const normalized = Array.isArray(value) ? value[0] : value
  if (normalized === undefined || normalized === null || normalized === '') {
    return null
  }
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function serializeQueryValue(value: LocationQueryValue | LocationQueryValue[] | null | undefined): string {
  if (Array.isArray(value)) {
    return value.join(',')
  }

  return value ?? ''
}

export function serializeQueryForKey(
  query: LocationQuery,
  excludedKeys: Iterable<string> = [],
): string {
  const excluded = new Set(excludedKeys)

  return Object.entries(query)
    .filter(([key]) => !excluded.has(key))
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${serializeQueryValue(value)}`)
    .join('&')
}
