import type { Chain } from '@/types'
import { Chains, chainToPrefixMap } from '@/types'

export default function () {
  const { existentialDeposit, currentChain } = useChain()
  const { balances } = storeToRefs(useAccountStore())

  const chainBalances = computed<Record<Chain, string>>(() => {
    return Object.values(Chains).reduce((acc, chain) => {
      acc[chain] = String(balances.value[chainToPrefixMap[chain]] || '0')
      return acc
    }, {} as Record<Chain, string>)
  })

  const currentChainBalance = computed<string | undefined>(
    () => currentChain.value && chainBalances.value[currentChain.value],
  )

  const transferableCurrentChainBalance = computed<number | undefined>(() =>
    currentChainBalance.value
      ? Number(currentChainBalance.value) - existentialDeposit.value
      : undefined,
  )

  return {
    currentChainBalance,
    transferableCurrentChainBalance,
  }
}
