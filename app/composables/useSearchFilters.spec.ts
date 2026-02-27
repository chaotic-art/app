import { describe, expect, it } from 'vitest'
import { useSearchFilters } from './useSearchFilters'

describe('useSearchFilters', () => {
  const { buildKeywordClause, buildNftSearchConstraints } = useSearchFilters()

  it('returns undefined keyword clause for empty phrase', () => {
    expect(buildKeywordClause('')).toBeUndefined()
  })

  it('builds OR keyword clause across name and metadata description', () => {
    expect(buildKeywordClause('freak')).toEqual({
      OR: [
        { name_containsInsensitive: 'freak' },
        { meta: { description_containsInsensitive: 'freak' } },
      ],
    })
  })

  it('keeps phrase search intact without token splitting', () => {
    expect(buildKeywordClause('blue red')).toEqual({
      OR: [
        { name_containsInsensitive: 'blue red' },
        { meta: { description_containsInsensitive: 'blue red' } },
      ],
    })
  })

  it('builds listed + keyword as AND clause', () => {
    expect(buildNftSearchConstraints({
      phrase: 'freak',
      listedMode: 'listed',
    })).toEqual({
      search: {
        AND: [
          { price_gt: '0' },
          {
            OR: [
              { name_containsInsensitive: 'freak' },
              { meta: { description_containsInsensitive: 'freak' } },
            ],
          },
        ],
      },
    })
  })

  it('builds unlisted + keyword using price_isNull plus keyword clause', () => {
    expect(buildNftSearchConstraints({
      phrase: 'freak',
      listedMode: 'unlisted',
    })).toEqual({
      search: {
        OR: [
          { name_containsInsensitive: 'freak' },
          { meta: { description_containsInsensitive: 'freak' } },
        ],
      },
      price_isNull: true,
    })
  })

  it('returns listed constraint without keyword when phrase is empty', () => {
    expect(buildNftSearchConstraints({
      phrase: '',
      listedMode: 'listed',
    })).toEqual({
      search: { price_gt: '0' },
    })
  })

  it('forceListed overrides unlisted mode', () => {
    expect(buildNftSearchConstraints({
      phrase: 'freak',
      listedMode: 'unlisted',
      forceListed: true,
    })).toEqual({
      search: {
        AND: [
          { price_gt: '0' },
          {
            OR: [
              { name_containsInsensitive: 'freak' },
              { meta: { description_containsInsensitive: 'freak' } },
            ],
          },
        ],
      },
    })
  })
})
