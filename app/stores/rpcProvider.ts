import type { PolkadotClient } from 'polkadot-api'
import type { SubstrateChain } from '~/types/chain'
import { PROVIDERS } from '~/config/providers'

export const useRpcProviderStore = defineStore('rpcProvider', () => {
  const selectedProviders = ref<Partial<Record<SubstrateChain, string>>>({})
  /** Last measured latency (ms) per chain for the current provider; used for Connection pill tooltip. */
  const lastLatencyByChain = ref<Partial<Record<SubstrateChain, number | null>>>({})

  function getProvider(chain: SubstrateChain): string {
    return selectedProviders.value[chain] || PROVIDERS[chain][0]
  }

  function setProvider(chain: SubstrateChain, url: string) {
    if (selectedProviders.value[chain] === url) {
      return
    }

    selectedProviders.value[chain] = url

    // Destroy existing client so it gets recreated with the new endpoint
    const clients = useState<Partial<Record<SubstrateChain, PolkadotClient>>>('sdk-clients')
    const existingClient = clients.value[chain]
    if (existingClient) {
      existingClient.destroy()
      delete clients.value[chain]
    }
  }

  function setLastLatency(chain: SubstrateChain, latency: number | null) {
    lastLatencyByChain.value[chain] = latency
  }

  return {
    selectedProviders,
    lastLatencyByChain,
    getProvider,
    setProvider,
    setLastLatency,
  }
}, {
  persist: {
    pick: ['selectedProviders'],
  },
})
