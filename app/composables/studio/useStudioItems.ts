export function useStudioItems() {
  const selectionMode = ref(false)
  const selectedItemIds = ref<Set<string>>(new Set())
  const searchQuery = ref('')
  const sortBy = ref('newest')

  const selectedCount = computed(() => selectedItemIds.value.size)

  function toggleSelection(id: string) {
    const newSet = new Set(selectedItemIds.value)
    if (newSet.has(id)) {
      newSet.delete(id)
    }
    else {
      newSet.add(id)
    }
    selectedItemIds.value = newSet
  }

  function selectAll(ids: string[]) {
    selectedItemIds.value = new Set(ids)
  }

  function clearSelection() {
    selectedItemIds.value = new Set()
  }

  function toggleSelectionMode() {
    selectionMode.value = !selectionMode.value
    if (!selectionMode.value) {
      clearSelection()
    }
  }

  return {
    selectionMode,
    selectedItemIds,
    selectedCount,
    searchQuery,
    sortBy,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectionMode,
  }
}
