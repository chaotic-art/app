import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain } from '@reown/appkit/networks'
import { WagmiPlugin } from '@wagmi/vue'

const westendAssetHub = defineChain({
  id: 420420421,
  caipNetworkId: 'eip155:420420421',
  chainNamespace: 'eip155',
  name: 'Westend Asset Hub',
  nativeCurrency: {
    decimals: 12,
    name: 'Westend',
    symbol: 'WND',
  },
  rpcUrls: {
    default: {
      http: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
    },
  },
  blockExplorers: {
    default: { name: 'Subscan', url: 'https://assethub-westend.subscan.io/' },
  },
  contracts: { },
})

const networks = [westendAssetHub]

const defaultNetwork = westendAssetHub

const metadata = {
  name: 'Chaotic',
  description: 'Chaotic - Generative Art Marketplace',
  url: 'https://chaotic.art',
  icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4'],
}

export default defineNuxtPlugin((nuxtApp) => {
  const buildWagmiAdapter = (projectId: string) => {
    return new WagmiAdapter({
      networks,
      projectId,
    })
  }

  const projectId = useRuntimeConfig().public.reownProjectId

  nuxtApp.vueApp.use(WagmiPlugin, { config: buildWagmiAdapter(projectId).wagmiConfig })

  return {
    provide: {
      wagmi: {
        adapter: buildWagmiAdapter(projectId),
        projectId,
        networks,
        defaultNetwork,
        metadata,
      },
    },
  }
})
