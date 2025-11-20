import type { ChainVM } from '@kodadot1/static'

interface AccountVm {
  address: string
  authSignature?: string
}

function getDefaultAccount(): AccountVm {
  return {
    address: '',
  }
}

export const useAccountStore = defineStore('account', () => {
  const { currentChain } = useChain()
  const { vm } = useVm()

  const loading = ref(false)
  const accounts = ref<Record<ChainVM, AccountVm>>({
    SUB: getDefaultAccount(),
    EVM: getDefaultAccount(),
  })

  const address = computed(() => {
    if (!accounts.value[vm.value].address) {
      return
    }

    if (vm.value === 'EVM') {
      return accounts.value[vm.value].address
    }

    try {
      return formatAddress({ address: accounts.value[vm.value].address, prefix: currentChain.value })
    }
    catch {
      return undefined
    }
  })

  const getAuthAddress = (vm: ChainVM) => {
    return accounts.value[vm]?.address
  }

  const getAuthSignature = (vm: ChainVM) => {
    return accounts.value[vm]?.authSignature
  }

  const setAuth = async ({ vm, address, authSignature }: { vm: ChainVM, address: string, authSignature?: string }) => {
    accounts.value[vm] = {
      address,
      authSignature,
    }
  }

  const clearAuth = async (vm: ChainVM) => {
    accounts.value[vm] = getDefaultAccount()
  }

  return {
    accounts,
    setAuth,
    clearAuth,
    loading,
    address,
    getAuthAddress,
    getAuthSignature,
  }
}, {
  persist: true,
})
