import type { SupportedChain } from '~/plugins/sdk.client'
import { measureLatency, SLOW_RPC_THRESHOLD_MS } from '~/composables/useRpcLatency'
import { PROVIDERS } from '~/config/providers'
import { useRpcProviderStore } from '~/stores/rpcProvider'

const AUTO_SWITCH_COOLDOWN_MS = 60_000

function hasRpcProviders(chain: string): chain is SupportedChain {
  return chain in PROVIDERS
}

/**
 * RPC auto-switch: when the current provider is slow (timeout or above threshold),
 * measure all providers and switch to the fastest. Runs on app:mounted, reacts to chain changes.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const { currentChain } = useChain()
    const rpcStore = useRpcProviderStore()
    const toast = useToast()
    const lastAutoSwitchAt = ref<Partial<Record<SupportedChain, number>>>({})
    const checkingChain = ref<SupportedChain | null>(null)

    async function checkAndSwitch(chain: SupportedChain) {
      if (checkingChain.value === chain) {
        return
      }
      checkingChain.value = chain
      try {
        const now = Date.now()
        if (now - (lastAutoSwitchAt.value[chain] ?? 0) < AUTO_SWITCH_COOLDOWN_MS) {
          return
        }

        const currentUrl = rpcStore.getProvider(chain)
        const latency = await measureLatency(currentUrl)
        rpcStore.setLastLatency(chain, latency)

        const isSlow = latency === null || latency > SLOW_RPC_THRESHOLD_MS
        if (!isSlow) {
          return
        }

        const allUrls = PROVIDERS[chain] ?? []
        const otherUrls = allUrls.filter(url => url !== currentUrl)
        const otherResults = await Promise.all(
          otherUrls.map(async url => ({ url, latency: await measureLatency(url) })),
        )
        const withLatency = [
          { url: currentUrl, latency },
          ...otherResults,
        ]
          .filter((r): r is { url: (typeof allUrls)[number], latency: number } => r.latency !== null)
          .sort((a, b) => a.latency - b.latency)

        if (withLatency.length === 0) {
          toast.add({
            title: 'All RPC providers are unreachable',
            description: 'Current provider is slow and all providers failed to respond.',
            color: 'error',
          })
          return
        }

        const fastest = withLatency[0]!
        if (fastest.url === currentUrl) {
          toast.add({
            title: 'No faster RPC provider found',
            description: 'Current provider is slow but no faster alternative was available.',
            color: 'warning',
          })
          return
        }

        rpcStore.setProvider(chain, fastest.url)
        rpcStore.setLastLatency(chain, fastest.latency)
        lastAutoSwitchAt.value[chain] = now

        toast.add({
          title: 'Switched to faster RPC',
          description: `RPC was slow; now using a provider with ${fastest.latency}ms latency.`,
          color: 'success',
        })
      }
      finally {
        checkingChain.value = null
      }
    }

    function runForCurrentChain() {
      const chain = currentChain.value
      if (chain && hasRpcProviders(chain)) {
        checkAndSwitch(chain).catch((err) => {
          console.error(err)
          toast.add({
            title: 'RPC auto-switch failed',
            description: 'An unexpected error occurred while checking RPC providers.',
            color: 'error',
          })
        })
      }
    }

    // Defer initial check to avoid delay and extra traffic on every page load
    setTimeout(runForCurrentChain, 2000)

    watch(currentChain, (chain) => {
      if (chain && hasRpcProviders(chain)) {
        checkAndSwitch(chain).catch((err) => {
          console.error(err)
          toast.add({
            title: 'RPC auto-switch failed',
            description: 'An unexpected error occurred while checking RPC providers.',
            color: 'error',
          })
        })
      }
    })
  })
})
