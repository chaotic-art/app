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

    async function checkAndSwitch(chain: SupportedChain) {
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

      const urls = PROVIDERS[chain] ?? []
      const results = await Promise.all(
        urls.map(async url => ({ url, latency: await measureLatency(url) })),
      )

      const withLatency = results
        .filter((r): r is { url: (typeof urls)[number], latency: number } => r.latency !== null)
        .sort((a, b) => a.latency - b.latency)

      const fastest = withLatency[0]
      if (!fastest || fastest.url === currentUrl) {
        lastAutoSwitchAt.value[chain] = now
        toast.add({
          title: 'No faster RPC provider found',
          description: 'Current provider is slow but no faster alternative was available.',
          color: 'warning',
        })
        return
      }

      toast.add({
        title: 'RPC is slow',
        description: 'Switching to a faster provider...',
        color: 'warning',
      })
      rpcStore.setProvider(chain, fastest.url)
      rpcStore.setLastLatency(chain, fastest.latency)
      lastAutoSwitchAt.value[chain] = now

      toast.add({
        title: 'Switched to faster RPC',
        description: `Now using a provider with ${fastest.latency}ms latency.`,
        color: 'success',
      })
    }

    watch(currentChain, (chain) => {
      if (chain && hasRpcProviders(chain)) {
        checkAndSwitch(chain).catch(console.error)
      }
    }, { immediate: true })
  })
})
