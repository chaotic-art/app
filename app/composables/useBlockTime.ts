import type { SupportedChain } from '~/plugins/sdk.client'

export default function () {
  const { currentChain } = useChain()

  const paraChainBlockTime = 12 // seconds
  const relayChainBlockTime = 6 // seconds

  const chainBlockTimes: Partial<Record<SupportedChain, number>> = {
    ksm: relayChainBlockTime,
    dot: relayChainBlockTime,
  }

  const blockTime = computed(
    () => chainBlockTimes[currentChain.value] ?? paraChainBlockTime,
  )

  const estimatedTimes = computed(() => ({
    [TransactionStatus.Broadcast]: 3 * blockTime.value,
    [TransactionStatus.Block]: 2 * blockTime.value,
  }))

  return {
    blockTime,
    estimatedTimes,
  }
}
