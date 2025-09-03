import type { AssetHubChain } from '~/plugins/sdk.client'
import { chainSpec } from '@/utils/chain'

export function useChain() {
  const route = useRoute()

  const currentChain = computed(() => (route.params as { chain: AssetHubChain }).chain || 'ahp')

  const chainName = computed(() => chainSpec[currentChain.value].name)
  const chainSymbol = computed(() => chainSpec[currentChain.value].tokenSymbol)
  const decimals = computed(() => chainSpec[currentChain.value].tokenDecimals)
  const ss58Format = computed(() => chainSpec[currentChain.value].ss58Format)

  return {
    decimals,
    chainSymbol,
    currentChain,
    chainName,
    ss58Format,
  }
}
