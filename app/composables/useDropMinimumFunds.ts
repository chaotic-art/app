export function useDropMinimumFunds() {
  const { drop } = useDrop()
  const { currentChain } = useChain()
  const { amountToMint: amount } = storeToRefs(useDropStore())
  const { itemDeposit, loading: depositLoading } = useDeposit(currentChain)

  const price = computed<number>(() => Number(drop.value?.price) || 0)
  const minimumFunds = computed<number>(() => amount.value * (price.value + itemDeposit.value))
  const loading = computed(() => depositLoading.value)

  return {
    minimumFunds,
    loading,
  }
}
