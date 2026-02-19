import type { SortContext, SortDefinition } from '~/utils/sort'
import { SORT_OPTIONS } from '~/utils/sort'

interface SelectSortOption {
  label: string
  value: string
  icon?: string
}

export function useSortOptions(context: SortContext) {
  const { t } = useI18n()

  const sortDefinitions = SORT_OPTIONS[context]
  const defaultSortKey = sortDefinitions[0].key
  const sortDefinitionByKey = Object.fromEntries(
    sortDefinitions.map(definition => [definition.key, definition]),
  ) as Record<string, SortDefinition>

  const sortOptions = computed<SelectSortOption[]>(() =>
    sortDefinitions.map(definition => ({
      label: t(definition.labelKey),
      value: definition.key,
      icon: definition.icon,
    })),
  )

  function normalizeSortKey(value: unknown): string {
    const normalized = Array.isArray(value) ? value[0] : value

    if (typeof normalized === 'string' && normalized in sortDefinitionByKey) {
      return normalized
    }

    return defaultSortKey
  }

  function getSortDefinition(value: unknown): SortDefinition {
    return sortDefinitionByKey[normalizeSortKey(value)] || sortDefinitions[0]
  }

  return {
    defaultSortKey,
    sortOptions,
    normalizeSortKey,
    getSortDefinition,
  }
}
