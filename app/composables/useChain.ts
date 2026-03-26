import type { Chain } from '@/types'
import { chainSpec } from '@/utils/chain'

export function useChain() {
  const route = useRoute()

  const currentChain = computed(() => (route.params as { chain: Chain }).chain || 'ahp')

  const chainName = computed(() => chainSpec[currentChain.value].name)
  const chainSymbol = computed(() => chainSpec[currentChain.value].tokenSymbol)
  const decimals = computed(() => chainSpec[currentChain.value].tokenDecimals)
  const ss58Format = computed(() => chainSpec[currentChain.value].ss58Format)
  const vm = computed(() => chainSpec[currentChain.value].vm)

  return {
    decimals,
    chainSymbol,
    currentChain,
    chainName,
    ss58Format,
    vm,
  }
}
