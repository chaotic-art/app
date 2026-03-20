import type { Chain } from 'viem'
import { cookieStorage, createConfig, createStorage, http, WagmiPlugin } from '@wagmi/vue'
import { injected } from '@wagmi/vue/connectors'
import { chainsForWagmi as networks } from '~/utils/viem'

export interface WagmiPluginProvide {
  config: ReturnType<typeof createConfig>
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = createConfig({
    chains: networks as [Chain, ...Chain[]],
    connectors: [injected()],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: Object.fromEntries(networks.map(chain => [chain.id, http()])),
  })

  nuxtApp.vueApp.use(WagmiPlugin, { config })

  return {
    provide: {
      wagmi: {
        config,
      } satisfies WagmiPluginProvide,
    },
  }
})
