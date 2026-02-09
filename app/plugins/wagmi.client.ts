import type { AppKitNetwork } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base } from '@reown/appkit/networks'
import { reconnect } from '@wagmi/core'
import { WagmiPlugin } from '@wagmi/vue'

const networks = [base]

const metadata = {
  name: 'Chaotic',
  description: 'Chaotic - Generative Art Marketplace',
  url: 'https://chaotic.art',
  icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4'],
}

export interface WagmiPluginProvide {
  adapter: WagmiAdapter
  projectId: string
  networks: typeof networks
  metadata: typeof metadata
}

export default defineNuxtPlugin((nuxtApp) => {
  const buildWagmiAdapter = (projectId: string) => {
    return new WagmiAdapter({
      networks: networks as never,
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
        metadata,
      } satisfies WagmiPluginProvide,
    },
  }
})
