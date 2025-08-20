import type { AssetHubChain } from '~/plugins/sdk.client'
import { chainSpec } from '@/utils/chain'

export function useChain() {
  const route = useRoute()
  const { chain } = route.params as { chain: AssetHubChain }

  const currentChain = computed(() => chain || 'ahp')

  const chainSymbol = computed(() => chainSpec[currentChain.value].tokenSymbol)
  const decimals = computed(() => chainSpec[currentChain.value].tokenDecimals)

  return {
    decimals,
    chainSymbol,
    currentChain,
  }
}
