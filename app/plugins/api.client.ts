import type { Prefix } from '@kodadot1/static'
import type { PolkadotClient, TypedApi } from 'polkadot-api'
import { createClient } from 'polkadot-api'
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat'
import { getWsProvider } from 'polkadot-api/ws-provider/web'
import { ahk, ahp, ahpas, dot, ksm } from '~/descriptors'

// TODO: provide more providers
const config = {
  ahp: {
    descriptor: ahp,
    providers: ['wss://polkadot-asset-hub-rpc.polkadot.io'],
  },
  ahk: {
    descriptor: ahk,
    providers: ['wss://kusama-asset-hub-rpc.polkadot.io'],
  },
  dot: {
    descriptor: dot,
    providers: ['wss://rpc.dotters.network/polkadot'],
  },
  ksm: {
    descriptor: ksm,
    providers: ['wss://kusama-rpc.polkadot.io'],
  },

  // testnet. faucet: https://faucet.polkadot.io/?parachain=1000
  ahpas: {
    descriptor: ahpas,
    providers: ['wss://pas-rpc.stakeworld.io/assethub'],
  },
}

type SupportedChain = keyof typeof config
type UnsupportedChain = 'base' | 'ahw'
export type Chain = SupportedChain | UnsupportedChain | Prefix

// Mapped type for API return types
type ApiMap = {
  [K in SupportedChain]: TypedApi<typeof config[K]['descriptor']>
}

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
function api<T extends SupportedChain>(chain: T): ApiMap[T]
// Overload for unsupported chains and default case
function api(chain?: UnsupportedChain | Prefix): ApiMap['ahp']
// Implementation
function api(chain: Chain = DEFAULT_CHAIN) {
  const effectiveChain = getEffectiveChain(chain)

  // Get or create client state
  const clients = useState<Partial<Record<SupportedChain, PolkadotClient>>>('api-clients', () => ({}))

  // Create client if it doesn't exist
  if (!clients.value[effectiveChain]) {
    const chainConfig = config[effectiveChain]
    clients.value[effectiveChain] = createClient(
      withPolkadotSdkCompat(getWsProvider(chainConfig.providers)),
    )
  }

  return clients.value[effectiveChain]!.getTypedApi(config[effectiveChain].descriptor)
}

export default defineNuxtPlugin(() => {
  return {
    provide: { api },
  }
})
