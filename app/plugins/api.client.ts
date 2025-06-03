import type { Prefix } from '@kodadot1/static'
import type { PolkadotClient, TypedApi } from 'polkadot-api'
import { ahk, ahp, dot, ksm } from '@polkadot-api/descriptors'
import { createClient } from 'polkadot-api'
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat'
import { getWsProvider } from 'polkadot-api/ws-provider/web'

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
}

// Type definitions for each chain's API
type AhpApi = TypedApi<typeof ahp>
type AhkApi = TypedApi<typeof ahk>
type DotApi = TypedApi<typeof dot>
type KsmApi = TypedApi<typeof ksm>

// Function overloads for proper type inference
function api(chain: 'ahp'): AhpApi
function api(chain: 'ahk'): AhkApi
function api(chain: 'dot'): DotApi
function api(chain: 'ksm'): KsmApi
function api(chain: 'base' | 'ahw'): AhpApi // These fallback to ahp
function api(chain?: Prefix): AhpApi // Default case
function api(chain: Prefix | 'base' | 'ahw' = 'ahp'): AhpApi | AhkApi | DotApi | KsmApi {
  // Handle explicitly unsupported chains
  if (chain === 'base' || chain === 'ahw') {
    console.warn(`Unsupported chain: ${chain}. Using ahp as fallback.`)
    const client = createClient(withPolkadotSdkCompat(getWsProvider(config.ahp.providers)))
    return client.getTypedApi(config.ahp.descriptor)
  }

  // Check if the chain exists in config
  if (!(chain in config)) {
    console.warn(`Chain ${chain} not found in config. Using ahp as fallback.`)
    const client = createClient(withPolkadotSdkCompat(getWsProvider(config.ahp.providers)))
    return client.getTypedApi(config.ahp.descriptor)
  }

  // store client in the state
  const client = useState<Record<Prefix, PolkadotClient | undefined>>('api-client', () => ({
    ahp: undefined,
    ahk: undefined,
    dot: undefined,
    ksm: undefined,
    base: undefined,
    ahw: undefined,
  }))

  // create client if it doesn't exist
  if (!client.value[chain]) {
    client.value[chain] = createClient(
      withPolkadotSdkCompat(getWsProvider(config[chain].providers)),
    )
  }

  // Return the proper descriptor for the supported chain
  const chainConfig = config[chain as keyof typeof config]
  return client.value[chain]?.getTypedApi(chainConfig.descriptor)
}

export default defineNuxtPlugin(() => {
  return {
    provide: { api },
  }
})
