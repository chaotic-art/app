import { useQuery } from '@tanstack/vue-query'

export default function ({ enabled = ref(true) }: { enabled?: Ref<boolean> } = {}) {
  const { getConnectedSubAccount } = storeToRefs(useWalletStore())
  const { getBalance } = useBalances()
  const { currentChain } = useChain()
  const { existentialDeposit } = useDeposit(currentChain)

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['wallet-balance', computed(() => getConnectedSubAccount.value?.address)],
    queryFn: () => {
      return getConnectedSubAccount.value
        ? getBalance({
            address: getConnectedSubAccount.value.address,
            prefix: currentChain.value,
          })
        : Promise.resolve(null)
    },
    enabled: computed(() => Boolean(getConnectedSubAccount.value) && enabled.value),
    staleTime: 10000,
    refetchInterval: 20000,
  })

  const balance = computed(() => Number(data.value?.balance ?? 0))
  const transferableBalance = computed(() => Math.max(balance.value - existentialDeposit.value, 0))

  return {
    balance,
    transferableBalance,
    isLoading,
  }
}
