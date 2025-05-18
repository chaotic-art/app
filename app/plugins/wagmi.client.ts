import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'
import { WagmiPlugin } from '@wagmi/vue'

const networks = [mainnet]

const defaultNetwork = mainnet

const metadata = {
  name: 'AppKit Nuxt Wagmi Example',
  description: 'AppKit Nuxt Wagmi Example',
  url: 'https://reown.com/appkit',
  icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4'],
}

export default defineNuxtPlugin((nuxtApp) => {
  const buildWagmiAdapter = (projectId: string) => {
    return new WagmiAdapter({
      networks,
      projectId,
    })
  }

  const projectId = useRuntimeConfig().public.walletConnectProjectId

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
