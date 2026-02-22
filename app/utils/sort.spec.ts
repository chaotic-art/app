import { describe, expect, it } from 'vitest'
import {
  buildOrderBy,
  dropImplicitDefaultSort,
  normalizeSortKeys,
  requiresListed,
  sortKeysToQueryValue,
  toggleSortKey,
} from './sort'

describe('sort utilities', () => {
  it('falls back to default key when sort query is empty or invalid', () => {
    expect(normalizeSortKeys('exploreNfts', undefined)).toEqual(['recent'])
    expect(normalizeSortKeys('exploreNfts', '')).toEqual(['recent'])
    expect(normalizeSortKeys('exploreNfts', ['invalid'])).toEqual(['recent'])
  })

  it('parses single, repeated, and comma-separated sort query values', () => {
    expect(normalizeSortKeys('exploreNfts', 'price_low')).toEqual(['price_low'])
    expect(normalizeSortKeys('exploreNfts', ['recent', 'price_low'])).toEqual(['recent', 'price_low'])
    expect(normalizeSortKeys('exploreNfts', 'recent,price_low')).toEqual(['recent', 'price_low'])
  })

  it('drops implicit default sort only when query had no explicit sort', () => {
    expect(dropImplicitDefaultSort(['recent', 'price_low'], 'recent', false)).toEqual(['price_low'])
    expect(dropImplicitDefaultSort(['recent', 'price_low'], 'recent', true)).toEqual(['recent', 'price_low'])
    expect(dropImplicitDefaultSort(['recent'], 'recent', false)).toEqual(['recent'])
  })

  it('toggles opposite group sorts by replacing the previous value', () => {
    expect(toggleSortKey('exploreNfts', ['recent'], 'oldest')).toEqual(['oldest'])
    expect(toggleSortKey('exploreNfts', ['recent', 'price_low'], 'price_low')).toEqual(['recent'])
  })

  it('builds orderBy by selected priority then tie-breakers', () => {
    expect(buildOrderBy('exploreNfts', ['recent'])).toEqual(['blockNumber_DESC', 'sn_DESC'])
    expect(buildOrderBy('exploreNfts', ['recent', 'price_low'])).toEqual(['blockNumber_DESC', 'price_ASC', 'sn_DESC'])
  })

  it('deduplicates conflicting tie-breaker fields by keeping the first occurrence', () => {
    expect(buildOrderBy('exploreNfts', ['recent', 'rarest'])).toEqual([
      'blockNumber_DESC',
      'rarityPercentile_ASC_NULLS_LAST',
      'sn_DESC',
      'rarityScore_DESC_NULLS_LAST',
    ])
  })

  it('returns true for requiresListed when any selected sort requires listings', () => {
    expect(requiresListed('exploreNfts', ['recent'])).toBe(false)
    expect(requiresListed('exploreNfts', ['recent', 'price_low'])).toBe(true)
  })

  it('serializes sort keys to route query values', () => {
    expect(sortKeysToQueryValue(['recent'], 'recent')).toBeUndefined()
    expect(sortKeysToQueryValue(['price_low'], 'recent')).toBe('price_low')
    expect(sortKeysToQueryValue(['recent', 'price_low'], 'recent')).toEqual(['recent', 'price_low'])
  })
})
