import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { reconnect } from '@wagmi/core'
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
      networks,
      projectId,
    })
  }

  const projectId = useRuntimeConfig().public.reownProjectId

  const adapter = buildWagmiAdapter(projectId)

  nuxtApp.vueApp.use(WagmiPlugin, { config: adapter.wagmiConfig })

  reconnect(adapter.wagmiConfig)

  return {
    provide: {
      wagmi: {
        adapter,
        projectId,
        networks,
        defaultNetwork,
        metadata,
      },
    },
  }
})
