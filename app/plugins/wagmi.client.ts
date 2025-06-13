import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { WagmiPlugin } from '@wagmi/vue'
import { westendAssetHub } from '@wagmi/vue/chains'

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
      // @ts-expect-error different types of networks
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
