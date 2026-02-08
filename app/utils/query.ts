import type { LocationQueryValue } from 'vue-router'

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

export function parseQueryCsv(
  value: LocationQueryValue | LocationQueryValue[] | null | undefined,
): string[] {
  const normalized = Array.isArray(value) ? value[0] : value
  if (normalized === undefined || normalized === null || normalized === '') {
    return []
  }

  return String(normalized)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}
