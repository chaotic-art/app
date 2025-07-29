export function useDropMinimumFunds() {
  const { drop } = useDrop()
  const { prefix } = usePrefix()
  const { itemDeposit } = useDeposit(prefix)
  const { amountToMint: amount } = storeToRefs(useDropStore())

  const chainProperties = computed(() => chainPropListOf(drop.value.chain ?? 'ahp'))

  const { existentialDeposit } = useChain()
  const { transferableCurrentChainBalance } = useMultipleBalance()

  const price = computed<number>(() => Number(drop.value?.price) || 0)
  const minimumFunds = computed<number>(() => amount.value * (price.value + itemDeposit.value))
  const hasMinimumFunds = computed(
    () =>
      !minimumFunds.value
      || (transferableCurrentChainBalance.value ?? 0) >= minimumFunds.value,
  )
  const tokenDecimals = computed(() => chainProperties.value.tokenDecimals)
  const tokenSymbol = computed(() => chainProperties.value.tokenSymbol)

  const { formatted: formattedMinimumFunds, usd: formattedMinimumFundsUSD } = useAmount(
    minimumFunds,
    tokenDecimals,
    tokenSymbol,
  )

  const { formatted: formattedExistentialDeposit } = useAmount(
    existentialDeposit,
    tokenDecimals,
    tokenSymbol,
  )

  // onBeforeMount(fetchMultipleBalance)

  return {
    minimumFunds,
    hasMinimumFunds,
    formattedMinimumFunds,
    formattedMinimumFundsUSD,
    formattedExistentialDeposit,
  }
}
