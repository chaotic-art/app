import type { ChainProperties, Prefix } from '@kodadot1/static'
import { chainPropListOf } from '@/utils/chain'

export function useChain() {
  const { prefix } = usePrefix()

  const vm = computed(() => vmOf(prefix.value))

  const chainProperties = computed<ChainProperties>(() => {
    return chainPropListOf(prefix.value)
  })

  const chainSymbol = computed(() => chainProperties.value.tokenSymbol)

  const decimals = computed<number>(() => {
    return chainProperties.value.tokenDecimals
  })

  const decimalsOf = (prefix: Prefix) => {
    return chainPropListOf(prefix).tokenDecimals
  }

  const withDecimals = (value: number, chainPrefix: Prefix = prefix.value) => {
    const decimals = chainPropListOf(chainPrefix).tokenDecimals
    // if already with decimals
    if (value.toString().length === decimals) {
      return value
    }

    return Math.trunc(value * 10 ** decimals)
  }
  return {
    vm,
    chainProperties,
    decimals,
    decimalsOf,
    withDecimals,
    chainSymbol,
  }
}
