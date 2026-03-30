export default function () {
  const paraChainBlockTime = 12 // seconds
  const blockTime = computed(() => paraChainBlockTime)

  const estimatedTimes = computed(() => ({
    [TransactionStatus.Broadcast]: 3 * blockTime.value,
    [TransactionStatus.Block]: 2 * blockTime.value,
  }))

  return {
    blockTime,
    estimatedTimes,
  }
}
