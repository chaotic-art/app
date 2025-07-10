import type { Prefix } from '@kodadot1/static'
import { refreshOdaCollection } from '~/services/oda'

export function useOda() {
  const isRefreshing = ref(false)

  const clearCache = async (chain: Prefix, collectionId: string, refresh?: () => Promise<void>) => {
    if (isRefreshing.value)
      return

    try {
      isRefreshing.value = true

      // Clear the cache on the server
      await refreshOdaCollection(chain, collectionId)

      // Refresh the local data if refresh function is provided
      if (refresh) {
        await refresh()
      }

      // Show success message
      const toast = useToast()
      toast.add({
        title: 'Cache cleared successfully',
        description: 'Collection data has been refreshed',
        color: 'success',
      })
    }
    catch (error) {
      console.error('Error clearing cache:', error)
      const toast = useToast()
      toast.add({
        title: 'Error clearing cache',
        description: 'Failed to refresh collection data',
        color: 'error',
      })
    }
    finally {
      isRefreshing.value = false
    }
  }

  return {
    isRefreshing: readonly(isRefreshing),
    clearCache,
  }
}
