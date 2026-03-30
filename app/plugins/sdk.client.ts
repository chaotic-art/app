import type { PolkadotClient, TypedApi } from 'polkadot-api'
import { createClient } from 'polkadot-api'
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat'
import { getWsProvider } from 'polkadot-api/ws-provider/web'
import { PROVIDERS } from '~/config/providers'
import { ahk, ahp, ahpas, dot, ksm } from '~/descriptors'
import { useRpcProviderStore } from '~/stores/rpcProvider'

const config = {
  ahp: {
    descriptor: ahp,
    providers: PROVIDERS.ahp,
  },
  ahk: {
    descriptor: ahk,
    providers: PROVIDERS.ahk,
  },
  dot: {
    descriptor: dot,
    providers: PROVIDERS.dot,
  },
  ksm: {
    descriptor: ksm,
    providers: PROVIDERS.ksm,
  },

  // testnet. faucet: https://faucet.polkadot.io/?parachain=1000
  ahpas: {
    descriptor: ahpas,
    providers: PROVIDERS.ahpas,
  },
}

export type SupportedPapiChain = keyof typeof config

// Mapped type for API return types
type ApiMap = {
  [K in SupportedPapiChain]: TypedApi<typeof config[K]['descriptor']>
}

type AssetHubPapiChain = Extract<SupportedPapiChain, 'ahp' | 'ahk' | 'ahpas'>

export type AssetHubApi = ApiMap[AssetHubPapiChain]

const DEFAULT_CHAIN = 'ahp' as const

// Generic function for supported chains
function sdk<T extends SupportedPapiChain>(chain: T): { api: ApiMap[T], client: PolkadotClient }
// Overload for default case
function sdk(): { api: ApiMap['ahp'], client: PolkadotClient }
// Implementation
function sdk(chain: SupportedPapiChain = DEFAULT_CHAIN) {
  // Get or create client state
  const clients = useState<Partial<Record<SupportedPapiChain, PolkadotClient>>>('sdk-clients', () => ({}))

  // Create client if it doesn't exist
  if (!clients.value[chain]) {
    const rpcStore = useRpcProviderStore()
    const selectedEndpoint = rpcStore.getProvider(chain)
    clients.value[chain] = createClient(
      withPolkadotSdkCompat(getWsProvider({ endpoints: [selectedEndpoint] })),
    )
  }

  return {
    api: clients.value[chain]!.getTypedApi(config[chain].descriptor),
    client: clients.value[chain]!,
  }
}

export default defineNuxtPlugin(() => {
  return {
    provide: { sdk },
  }
})
