import type { Prefix } from '@kodadot1/static'

export default function () {
  const { prefix } = usePrefix()

  const paraChainBlockTime = 12 // seconds
  const relayChainBlockTime = 6 // seconds

  const chainBlockTimes: Partial<Record<Prefix, number>> = {
    ksm: relayChainBlockTime,
    dot: relayChainBlockTime,
  }

  const blockTime = computed(
    () => chainBlockTimes[prefix.value] ?? paraChainBlockTime,
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
