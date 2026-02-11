import type { LocationQueryValue } from 'vue-router'

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
