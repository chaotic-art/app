import type { PolkadotClient } from 'polkadot-api'
import type { SupportedChain } from '~/plugins/sdk.client'
import { PROVIDERS } from '~/config/providers'

export const useRpcProviderStore = defineStore('rpcProvider', () => {
  const selectedProviders = ref<Partial<Record<SupportedChain, string>>>({})

  function getProvider(chain: SupportedChain): string {
    return selectedProviders.value[chain] || PROVIDERS[chain][0]
  }

  function setProvider(chain: SupportedChain, url: string) {
    if (selectedProviders.value[chain] === url) {
      return
    }

    selectedProviders.value[chain] = url

    // Destroy existing client so it gets recreated with the new endpoint
    const clients = useState<Partial<Record<SupportedChain, PolkadotClient>>>('sdk-clients')
    const existingClient = clients.value[chain]
    if (existingClient) {
      existingClient.destroy()
      delete clients.value[chain]
    }
  }

  return {
    selectedProviders,
    getProvider,
    setProvider,
  }
}, {
  persist: true,
})
