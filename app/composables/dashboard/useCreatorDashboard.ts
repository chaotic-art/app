import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OnchainCollection } from '~/services/oda'
import { fetchOdaCollection } from '~/services/oda'
import { isAssetHubChain } from '~/utils/chain'

export interface DashboardCollection {
  id: string
  chain: AssetHubChain
  metadata?: OnchainCollection['metadata']
  supply?: string
  claimed?: string
  floor: number | null
}

export function useCreatorDashboard() {
  const { accountId } = useAuth()
  const { currentChain } = useChain()

  const collections = ref<DashboardCollection[]>([])
  const loading = ref(false)

  const { data: collectionIds, isLoading: idsLoading } = useOwnedCollections(
    computed(() => accountId.value || ''),
  )

  let requestId = 0

  watch([collectionIds, currentChain], async ([ids, chain], _prev, onInvalidate) => {
    if (!ids || ids.length === 0) {
      collections.value = []
      loading.value = false
      return
    }

    const currentRequestId = ++requestId
    let isCancelled = false

    onInvalidate(() => {
      isCancelled = true
    })

    loading.value = true

    try {
      // Only fetch for AssetHub chains (ahp, ahk, ahpas)
      if (!isAssetHubChain(chain)) {
        collections.value = []
        loading.value = false
        return
      }

      const results = await Promise.allSettled(
        ids.map(id => fetchOdaCollection(chain, id)),
      )

      if (isCancelled || requestId !== currentRequestId) {
        return
      }

      collections.value = results
        .map((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            return {
              id: ids[index]!,
              chain,
              metadata: result.value.metadata,
              supply: result.value.supply,
              claimed: result.value.claimed,
              floor: result.value.floor ?? null,
            } as DashboardCollection
          }
          return null
        })
        .filter((c): c is DashboardCollection => c !== null)
    }
    catch {
      if (isCancelled || requestId !== currentRequestId) {
        return
      }
      collections.value = []
    }
    finally {
      if (!isCancelled && requestId === currentRequestId) {
        loading.value = false
      }
    }
  }, { immediate: true })

  const isLoading = computed(() => idsLoading.value || loading.value)
  const hasCollections = computed(() => collections.value.length > 0)

  return {
    collections,
    isLoading,
    hasCollections,
  }
}
