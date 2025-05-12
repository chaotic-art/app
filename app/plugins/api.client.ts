import { ahk, ahp } from '@polkadot-api/descriptors'
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
