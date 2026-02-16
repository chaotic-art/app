export function useAdminSidebar() {
  const route = useRoute()

  const isOpen = ref(route.query.admin === 'true')
  const selectionMode = ref(false)
  const selectedItemIds = ref<Set<string>>(new Set())
  const selectedItemForDetail = ref<string | null>(null)

  const sidebarView = computed<'default' | 'selection' | 'itemDetail'>(() => {
    if (selectedItemForDetail.value)
      return 'itemDetail'
    if (selectionMode.value)
      return 'selection'
    return 'default'
  })

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

  function closeItemDetail() {
    selectedItemForDetail.value = null
  }

  function toggleSelectionMode() {
    selectionMode.value = !selectionMode.value
    if (!selectionMode.value) {
      clearSelection()
    }
  }

  function closeSidebar() {
    isOpen.value = false
    selectionMode.value = false
    clearSelection()
    closeItemDetail()
  }

  function openSidebar() {
    isOpen.value = true
  }

  return {
    isOpen,
    selectionMode,
    selectedItemIds,
    selectedItemForDetail,
    sidebarView,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection,
    closeItemDetail,
    toggleSelectionMode,
    closeSidebar,
    openSidebar,
  }
}
