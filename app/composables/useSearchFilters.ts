type WhereFilter = Record<string, unknown>

export type ListedFilterMode = 'all' | 'listed' | 'unlisted'
export type SearchScope = 'nfts' | 'collections'

interface BuildNftSearchConstraintOptions {
  phrase?: string
  listedMode: ListedFilterMode
  forceListed?: boolean
}

interface BuildKeywordClauseOptions {
  scope: SearchScope
}

interface NftSearchConstraints {
  search?: WhereFilter
  price_isNull?: boolean
}

export function useSearchFilters() {
  function buildKeywordClause(
    phrase: string,
    { scope }: BuildKeywordClauseOptions,
  ): WhereFilter | undefined {
    const normalizedPhrase = phrase.trim()

    if (!normalizedPhrase) {
      return undefined
    }

    const orClauses: WhereFilter[] = [
      { name_containsInsensitive: normalizedPhrase },
      { meta: { description_containsInsensitive: normalizedPhrase } },
    ]

    if (scope === 'nfts') {
      orClauses.push({
        normalizedAttributes_some: {
          attribute: {
            value_containsInsensitive: normalizedPhrase,
          },
        },
      })
    }

    return {
      OR: orClauses,
    }
  }

  function buildNftSearchConstraints({
    phrase,
    listedMode,
    forceListed = false,
  }: BuildNftSearchConstraintOptions): NftSearchConstraints {
    const keywordClause = phrase
      ? buildKeywordClause(phrase, { scope: 'nfts' })
      : undefined
    const listedOnly = forceListed || listedMode === 'listed'
    const unlistedOnly = !listedOnly && listedMode === 'unlisted'

    if (listedOnly) {
      const listedClause = { price_gt: '0' }
      const search = keywordClause
        ? { AND: [listedClause, keywordClause] }
        : listedClause

      return { search }
    }

    return {
      ...(keywordClause ? { search: keywordClause } : {}),
      ...(unlistedOnly ? { price_isNull: true } : {}),
    }
  }

  return {
    buildKeywordClause,
    buildNftSearchConstraints,
  }
}
