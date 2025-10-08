import { getDropAttributes } from '@/components/drop/utils'

export function useDrop(alias?: string) {
  const { params } = useRoute()
  const { drop } = storeToRefs(useDropStore())

  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const lastFetchedAlias = ref<string | null>(null)

  const fetchDrop = async (dropAlias: string) => {
    if (!dropAlias) {
      return
    }

    // Don't refetch if we already have data for this alias
    if (lastFetchedAlias.value === dropAlias && drop.value) {
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const dropAttributes = await getDropAttributes(dropAlias)

      if (dropAttributes) {
        drop.value = dropAttributes
        lastFetchedAlias.value = dropAlias
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to fetch drop')
    }
    finally {
      isLoading.value = false
    }
  }

  watchEffect(() => {
    const dropAlias = alias ?? params.slug?.toString()

    if (dropAlias)
      fetchDrop(dropAlias)
  })

  return {
    drop,
    isLoading,
    error,
    fetchDrop,
  }
}
