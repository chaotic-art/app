function hasQueryValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(item => typeof item === 'string' && item.length > 0)
  }

  return typeof value === 'string' && value.length > 0
}

function hasTrueValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.includes('true')
  }

  return value === 'true'
}

export function useExploreFilterToggleState() {
  const route = useRoute()
  const { exploreSidebarCollapsed: sidebarCollapsed } = storeToRefs(usePreferencesStore())

  const activeFiltersCount = computed(() => {
    let count = 0

    const hasPriceFilter = hasQueryValue(route.query.min_price) || hasQueryValue(route.query.max_price)

    if (hasPriceFilter) {
      count++
    }

    if (hasTrueValue(route.query.below_floor)) {
      count++
    }

    if (hasQueryValue(route.query.last_sale)) {
      count++
    }

    return count
  })

  function openFilters() {
    sidebarCollapsed.value = false
  }

  return {
    sidebarCollapsed,
    activeFiltersCount,
    openFilters,
  }
}
