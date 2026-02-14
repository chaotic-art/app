import type { SupportedChain } from '~/plugins/sdk.client'
import { measureLatency, SLOW_RPC_THRESHOLD_MS } from '~/composables/useRpcLatency'
import { PROVIDERS } from '~/config/providers'
import { useRpcProviderStore } from '~/stores/rpcProvider'

const AUTO_SWITCH_COOLDOWN_MS = 60_000

/**
 * Auto-switch to the fastest RPC provider when the current one is slow (timeout or latency > threshold).
 * Call from layout so it runs once per app; reacts to chain changes.
 */
export function useRpcAutoSwitch() {
  const { currentChain } = useChain()
  const rpcStore = useRpcProviderStore()
  const lastAutoSwitchAt = ref<Record<string, number>>({})

  async function checkAndSwitch(chain: SupportedChain) {
    const now = Date.now()
    if (now - (lastAutoSwitchAt.value[chain] ?? 0) < AUTO_SWITCH_COOLDOWN_MS) {
      return
    }

    const currentUrl = rpcStore.getProvider(chain)
    const latency = await measureLatency(currentUrl)

    const isSlow = latency === null || latency > SLOW_RPC_THRESHOLD_MS
    if (!isSlow) {
      return
    }

    const toast = useToast()
    toast.add({
      title: 'RPC is slow',
      description: 'Switching to a faster provider...',
      color: 'warning',
    })

    const urls = PROVIDERS[chain] ?? []
    const results = await Promise.all(
      urls.map(async url => ({ url, latency: await measureLatency(url) })),
    )

    const withLatency = results
      .filter((r): r is { url: typeof urls[number], latency: number } => r.latency !== null)
      .sort((a, b) => a.latency - b.latency)

    const fastest = withLatency[0]
    if (!fastest || fastest.url === currentUrl) {
      return
    }

    rpcStore.setProvider(chain, fastest.url)
    lastAutoSwitchAt.value[chain] = now

    toast.add({
      title: 'Switched to faster RPC',
      description: `Now using a provider with ${fastest.latency}ms latency.`,
      color: 'success',
    })
  }

  function runForCurrentChain() {
    const chain = currentChain.value as SupportedChain
    if (chain && PROVIDERS[chain]) {
      checkAndSwitch(chain)
    }
  }

  onMounted(() => {
    runForCurrentChain()
  })

  watch(currentChain, (chain) => {
    if (chain && PROVIDERS[chain as SupportedChain]) {
      checkAndSwitch(chain as SupportedChain)
    }
  })
}
