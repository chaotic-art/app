import { ahk, ahp, dot, ksm } from '@polkadot-api/descriptors'
import { createClient } from 'polkadot-api'
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat'
import { getWsProvider } from 'polkadot-api/ws-provider/web'

// TODO: provide more providers
const dotApi = {
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

function api(chain: 'ahp' | 'ahk' = 'ahp') {
  const client = createClient(
    withPolkadotSdkCompat(
      getWsProvider(dotApi[chain].providers),
    ),
  )

  return client.getTypedApi(dotApi[chain].descriptor)
}

export default defineNuxtPlugin(() => {
  return {
    provide: { api },
  }
})
