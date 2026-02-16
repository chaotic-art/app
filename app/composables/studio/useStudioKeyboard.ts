export function useStudioKeyboard(options?: {
  onSave?: () => void
  onSelectAll?: () => void
  onEscape?: () => void
}) {
  const showOverlay = ref(false)

  function handleKeydown(e: KeyboardEvent) {
    const isMeta = e.metaKey || e.ctrlKey

    // ? → show shortcut overlay
    if (e.key === '?' && !isMeta) {
      e.preventDefault()
      showOverlay.value = !showOverlay.value
      return
    }

    // Escape → close overlay or delegate
    if (e.key === 'Escape') {
      if (showOverlay.value) {
        showOverlay.value = false
        return
      }
      options?.onEscape?.()
      return
    }

    // Cmd+S → save
    if (isMeta && e.key === 's') {
      e.preventDefault()
      options?.onSave?.()
      return
    }

    // Cmd+A → select all
    if (isMeta && e.key === 'a') {
      // Only intercept if not in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA')
        return
      e.preventDefault()
      options?.onSelectAll?.()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    showOverlay,
  }
}
