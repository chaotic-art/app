export function useDropMinimumFunds() {
  const { drop } = useDrop()
  const { currentChain } = useChain()
  const { itemDeposit } = useDeposit(currentChain)
  const { amountToMint: amount } = storeToRefs(useDropStore())

  const price = computed<number>(() => Number(drop.value?.price) || 0)
  const minimumFunds = computed<number>(() => amount.value * (price.value + itemDeposit.value))

  return {
    minimumFunds,
  }
}
