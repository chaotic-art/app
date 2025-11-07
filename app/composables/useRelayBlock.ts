import type { AssetHubChain } from '~/plugins/sdk.client'
import { getRelayNow } from '@/composables/onchain/utils'

interface UseRelayBlockOptions {
  /**
   * When true, call refresh on first use automatically. We avoid polling by default.
   */
  auto?: boolean
}

export default function useRelayBlock(options: UseRelayBlockOptions = {}) {
  const { $sdk } = useNuxtApp()
  const { currentChain } = useChain()

  const cache = useState<Partial<Record<AssetHubChain, number | null>>>(
    'relay-block-cache',
    () => ({}),
  )
  const loadingState = useState<Partial<Record<AssetHubChain, boolean>>>(
    'relay-block-loading',
    () => ({}),
  )

  const relayBlock = computed<number | null>({
    get: () => (cache.value[currentChain.value] ?? null) as number | null,
    set: (v) => { cache.value[currentChain.value] = v },
  })

  const loading = computed<boolean>(() => Boolean(loadingState.value[currentChain.value]))

  const refresh = async (force = false) => {
    if (loading.value)
      return
    if (relayBlock.value && !force)
      return

    loadingState.value[currentChain.value] = true
    try {
      const api = $sdk(currentChain.value).api
      const relayNow = await getRelayNow(api)
      if (relayNow > 0) {
        relayBlock.value = relayNow
      }
    }
    finally {
      loadingState.value[currentChain.value] = false
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
