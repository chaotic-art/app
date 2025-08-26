import { useQuery } from '@tanstack/vue-query'

export default function ({ enabled = ref(true) }: { enabled?: Ref<boolean> } = {}) {
  const { getConnectedSubAccount } = storeToRefs(useWalletStore())
  const { getBalance } = useBalances()
  const { prefix } = usePrefix()

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['wallet-balance', computed(() => getConnectedSubAccount.value?.address)],
    queryFn: () => {
      return getConnectedSubAccount.value
        ? getBalance({
            address: getConnectedSubAccount.value.address,
            prefix: prefix.value,
          })
        : Promise.resolve(null)
    },
    enabled: computed(() => Boolean(getConnectedSubAccount.value) && enabled.value),
    staleTime: 30000,
    refetchInterval: 60000,
  })

  return {
    balance: computed(() => Number(data.value?.balance ?? 0)),
    isLoading,
  }
}
