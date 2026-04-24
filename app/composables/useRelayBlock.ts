import type { AssetHubChain } from '~/types/chain'
import { getRelayNow } from '@/composables/onchain/utils'

interface UseRelayBlockOptions {
  /**
   * When true, call refresh on first use automatically. We avoid polling by default.
   */
  auto?: boolean
}

export default function useRelayBlock(options: UseRelayBlockOptions = {}) {
  const { $sdk } = useNuxtApp()
  const { assetHubChain: relaySourceChain } = useChain()

  const cache = useState<Partial<Record<AssetHubChain, number | null>>>(
    'relay-block-cache',
    () => ({}),
  )
  const loadingState = useState<Partial<Record<AssetHubChain, boolean>>>(
    'relay-block-loading',
    () => ({}),
  )

  const relayBlock = computed<number | null>({
    get: () => relaySourceChain.value ? (cache.value[relaySourceChain.value] ?? null) : null,
    set: (v) => {
      if (relaySourceChain.value) {
        cache.value[relaySourceChain.value] = v
      }
    },
  })

  const loading = computed<boolean>(() => relaySourceChain.value ? Boolean(loadingState.value[relaySourceChain.value]) : false)

  const refresh = async (force = false) => {
    if (!relaySourceChain.value)
      return
    if (loading.value)
      return
    if (relayBlock.value && !force)
      return

    loadingState.value[relaySourceChain.value] = true
    try {
      const api = $sdk(relaySourceChain.value).api
      const relayNow = await getRelayNow(api)
      if (relayNow > 0) {
        relayBlock.value = relayNow
      }
    }
    finally {
      loadingState.value[relaySourceChain.value] = false
    }
  }

  if (options.auto) {
    watchEffect(() => {
      if (!relayBlock.value) {
        refresh(false)
      }
    })
  }

  return { relayBlock, refresh, loading }
}
