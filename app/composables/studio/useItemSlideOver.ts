export function useItemSlideOver() {
  const currentItemId = ref<string | null>(null)

  const isOpen = computed(() => currentItemId.value !== null)

  function openItem(id: string) {
    currentItemId.value = id
  }

  function closeItem() {
    currentItemId.value = null
  }

  return {
    currentItemId,
    isOpen,
    openItem,
    closeItem,
  }
}
