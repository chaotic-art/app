import type { ChainProperties } from '@kodadot1/static'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { existentialDeposit as chainsExistentialDeposit } from '@kodadot1/static'
import { chainPropListOf } from '@/utils/chain'

export function useChain() {
  const route = useRoute()
  const { chain } = route.params as { chain: AssetHubChain }

  const { prefix } = usePrefix()

  const vm = computed(() => vmOf(prefix.value))

  const chainProperties = computed<ChainProperties>(() => {
    return chainPropListOf(prefix.value)
  })

  const chainSymbol = computed(() => chainProperties.value.tokenSymbol)

  const decimals = computed<number>(() => {
    return chainProperties.value.tokenDecimals
  })

  const existentialDeposit = computed<number>(
    () => chainsExistentialDeposit[prefix.value],
  )

  const currentChain = computed(() => chain || 'ahp')

  return {
    vm,
    chainProperties,
    decimals,
    chainSymbol,
    existentialDeposit,
    currentChain,
  }
}
