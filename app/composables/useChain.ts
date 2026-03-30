import type { OdaChain } from '~/services/oda'
import { canInteract, chainConfig, getAssetHubChain } from '@/utils/chain'

export function useChain() {
  const route = useRoute()

  const currentChain = computed(() => (route.params as { chain: OdaChain }).chain || 'ahp')

  const spec = computed(() => chainConfig[currentChain.value])
  const assetHubChain = computed(() => getAssetHubChain(currentChain.value))
  const canInteractOnChain = computed(() => canInteract(currentChain.value))
  const chainName = computed(() => spec.value.name)
  const chainSymbol = computed(() => spec.value.tokenSymbol)
  const decimals = computed(() => spec.value.tokenDecimals)
  const ss58Format = computed(() => spec.value.vm === 'SUB' ? spec.value.ss58Format : undefined)
  const vm = computed(() => spec.value.vm)

  return {
    assetHubChain,
    decimals,
    chainSymbol,
    currentChain,
    chainName,
    ss58Format,
    vm,
    canInteract: canInteractOnChain,
  }
}
