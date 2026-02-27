type WhereFilter = Record<string, unknown>

export type ListedFilterMode = 'all' | 'listed' | 'unlisted'

interface BuildNftSearchConstraintOptions {
  phrase?: string
  listedMode: ListedFilterMode
  forceListed?: boolean
}

interface NftSearchConstraints {
  search?: WhereFilter
  price_isNull?: boolean
}

export function useSearchFilters() {
  function buildKeywordClause(phrase: string): WhereFilter | undefined {
    const normalizedPhrase = phrase.trim()

    if (!normalizedPhrase) {
      return undefined
    }

    return {
      OR: [
        { name_containsInsensitive: normalizedPhrase },
        { meta: { description_containsInsensitive: normalizedPhrase } },
      ],
    }
  }

  function buildNftSearchConstraints({
    phrase,
    listedMode,
    forceListed = false,
  }: BuildNftSearchConstraintOptions): NftSearchConstraints {
    const keywordClause = phrase ? buildKeywordClause(phrase) : undefined
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
