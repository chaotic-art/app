import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OnchainCollection } from '~/services/oda'
import { fetchOdaCollection } from '~/services/oda'

export interface DashboardCollection {
  id: string
  chain: AssetHubChain
  metadata?: OnchainCollection['metadata']
  supply?: string
  claimed?: string
  floor: number | null
}

const MOCK_COLLECTIONS: DashboardCollection[] = [
  {
    id: '42',
    chain: 'ahp' as AssetHubChain,
    metadata: { name: 'Cosmic Explorers', description: 'A generative art collection exploring digital space.', image: '', banner: '' },
    supply: '200',
    claimed: '47',
    floor: 1500000000,
  },
  {
    id: '108',
    chain: 'ahp' as AssetHubChain,
    metadata: { name: 'Polka Punks', description: 'Pixel art characters on Polkadot.', image: '', banner: '' },
    supply: '1000',
    claimed: '312',
    floor: 800000000,
  },
  {
    id: '256',
    chain: 'ahp' as AssetHubChain,
    metadata: { name: 'Abstract Realms', description: 'Abstract paintings minted on-chain.', image: '', banner: '' },
    supply: '50',
    claimed: '50',
    floor: 5000000000,
  },
  {
    id: '7',
    chain: 'ahp' as AssetHubChain,
    metadata: { name: 'Nature Frames', description: 'Photography collection of landscapes and wildlife.', image: '', banner: '' },
    supply: '500',
    claimed: '89',
    floor: null,
  },
]

export function useCreatorDashboard(options?: { mock?: boolean }) {
  const { accountId } = useAuth()
  const { currentChain } = useChain()

  const collections = ref<DashboardCollection[]>([])
  const loading = ref(false)

  if (options?.mock) {
    collections.value = MOCK_COLLECTIONS
    return {
      collections,
      isLoading: computed(() => false),
      hasCollections: computed(() => true),
    }
  }

  const { data: collectionIds, isLoading: idsLoading } = useOwnedCollections(
    computed(() => accountId.value || ''),
  )

  let requestId = 0

  watch([collectionIds, currentChain], async ([ids, chain], _prev, onInvalidate) => {
    if (!ids || ids.length === 0) {
      collections.value = []
      return
    }

    const currentRequestId = ++requestId
    let isCancelled = false

    onInvalidate(() => {
      isCancelled = true
    })

    loading.value = true

    try {
      const results = await Promise.allSettled(
        ids.map(id => fetchOdaCollection(chain as AssetHubChain, id)),
      )

      if (isCancelled || requestId !== currentRequestId) {
        return
      }

      collections.value = results
        .map((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            return {
              id: ids[index]!,
              chain: chain as AssetHubChain,
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
