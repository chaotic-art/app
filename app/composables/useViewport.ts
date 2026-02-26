import { useWindowSize } from '@vueuse/core'

export function useViewport() {
  const { width } = useWindowSize()
  const isMobileViewport = computed(() => width.value < 768)

  return {
    isMobileViewport,
  }
}
