export function useDropMinimumFunds() {
  const { drop } = useDrop()
  const { prefix } = usePrefix()
  const { itemDeposit } = useDeposit(prefix)
  const { amountToMint: amount } = storeToRefs(useDropStore())

  const price = computed<number>(() => Number(drop.value?.price) || 0)
  const minimumFunds = computed<number>(() => amount.value * (price.value + itemDeposit.value))

  return {
    minimumFunds,
  }
}
