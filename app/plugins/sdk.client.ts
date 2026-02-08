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

export type SupportedChain = keyof typeof config

export type AssetHubChain = Extract<SupportedChain, 'ahp' | 'ahk' | 'ahpas'>
export type UnsupportedChain = 'base' | 'ahw'
export type Chain = SupportedChain | UnsupportedChain

// Mapped type for API return types
type ApiMap = {
  [K in SupportedChain]: TypedApi<typeof config[K]['descriptor']>
}

export type AssetHubApi = ApiMap[AssetHubChain]

const DEFAULT_CHAIN = 'ahp' as const
const UNSUPPORTED_CHAINS: UnsupportedChain[] = ['base', 'ahw']

function getEffectiveChain(chain: Chain): SupportedChain {
  if (UNSUPPORTED_CHAINS.includes(chain as UnsupportedChain)) {
    console.warn(`Unsupported chain: ${chain}. Using ${DEFAULT_CHAIN} as fallback.`)
    return DEFAULT_CHAIN
  }

  if (!(chain in config)) {
    console.warn(`Chain ${chain} not found in config. Using ${DEFAULT_CHAIN} as fallback.`)
    return DEFAULT_CHAIN
  }

  return chain as SupportedChain
}

// Generic function for supported chains
function sdk<T extends SupportedChain>(chain: T): { api: ApiMap[T], client: PolkadotClient }
// Overload for unsupported chains and default case
function sdk(chain?: UnsupportedChain | SupportedChain): { api: ApiMap['ahp'], client: PolkadotClient }
// Implementation
function sdk(chain: Chain = DEFAULT_CHAIN) {
  const effectiveChain = getEffectiveChain(chain)

  // Get or create client state
  const clients = useState<Partial<Record<SupportedChain, PolkadotClient>>>('sdk-clients', () => ({}))

  // Create client if it doesn't exist
  if (!clients.value[effectiveChain]) {
    const rpcStore = useRpcProviderStore()
    const selectedEndpoint = rpcStore.getProvider(effectiveChain)
    clients.value[effectiveChain] = createClient(
      withPolkadotSdkCompat(getWsProvider({ endpoints: [selectedEndpoint] })),
    )
  }

  return {
    api: clients.value[effectiveChain]!.getTypedApi(config[effectiveChain].descriptor),
    client: clients.value[effectiveChain]!,
  }
}

export default defineNuxtPlugin(() => {
  return {
    provide: { sdk },
  }
})
