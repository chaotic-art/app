import type { ChainVM, Prefix } from '@kodadot1/static'
import type { AccountVm, ChainData, TokenDetail, TokenKey } from './types'
import type { Chain } from '@/types/chain'
import { getDefaultAccount, getVMSupportedAssets, vmChains } from './utils'

export const useAccountStore = defineStore('account', () => {
  const { prefix } = usePrefix()
  const { vm } = useChain()

  const loading = ref(false)
  const accounts = ref<Record<ChainVM, AccountVm>>({
    SUB: getDefaultAccount(),
    EVM: getDefaultAccount(),
  })

  const getVmAccount = (vm: ChainVM) => {
    return accounts.value[vm].chains[getChainOfPrefix(prefix.value)]
  }

  const getChainAddress = ({ chain, address }: { chain: Chain, address: string }) => {
    const prefix = getPrefixOfChain(chain)
    return vmOf(prefix) === 'SUB' ? formatAddress({ address, prefix }) : address
  }

  const address = computed(() => getVmAccount(vm.value)?.address)

  const balances = computed(() => {
    const result: Partial<Record<Prefix, string>> = {}

    for (const account of Object.values(accounts.value)) {
      for (const [chain, chainData] of Object.entries(account.chains)) {
        const prefix = getPrefixOfChain(chain as Chain)
        const nativeToken = tokenSymbolOf<TokenKey>(prefix)

        if (chainData.assets[nativeToken]) {
          result[prefix] = chainData.assets[nativeToken].balance
        }
      }
    }

    return result
  })

  const balance = computed(() => balances.value[prefix.value])

  const getUpdatedChainData = ({ vm, chain, address, balances }: { vm: ChainVM, chain: Chain, address: string, balances: GetBalancesResult }): ChainData => {
    const chainPrefix = getPrefixOfChain(chain)
    const supportedTokens = getVMSupportedAssets(vm).filter(({ prefix }) => prefix === chainPrefix)

    const balanceMap = new Map(balances.map(b => [b.prefix, b.balance]))

    const assets = Object.fromEntries(
      supportedTokens.map(({ token, prefix }) => [
        token,
        {
          balance: String(balanceMap.get(prefix) || '0'),
        } as TokenDetail,
      ]),
    )

    return { address, assets }
  }

  const updateAccountChainsBalances = ({ vm, balances }: { vm: ChainVM, balances: GetBalancesResult }) => {
    accounts.value[vm].chains = Object.fromEntries(
      vmChains[vm].map(chain => [
        chain,
        getUpdatedChainData({ vm, chain, address: accounts.value[vm].address, balances }),
      ]),
    )
  }

  const fetchBalance = async () => {
    const { getBalances } = useBalances()

    loading.value = true

    try {
      await Promise.all(Object.entries(accounts.value).map(async ([vm, account]) => {
        const accounts = getVMSupportedAssets(vm as ChainVM).map(asset => ({
          prefix: asset.prefix,
          address: getChainAddress({ chain: asset.chain, address: account.address }),
        }))

        const balances = await getBalances(accounts)

        updateAccountChainsBalances({
          vm: vm as ChainVM,
          balances,
        })
      }))
    }
    finally {
      loading.value = false
    }
  }

  const setAuth = async ({ vm, address }: { vm: ChainVM, address: string }) => {
    accounts.value[vm] = {
      address,
      chains: Object.fromEntries(
        vmChains[vm]
          .map(chain => [chain, {
            address: getChainAddress({ chain, address }),
            assets: {},
          }]),
      ),
    }
  }

  const clearAuth = async (vm: ChainVM) => {
    accounts.value[vm] = getDefaultAccount()
  }

  return {
    accounts,
    setAuth,
    clearAuth,
    fetchBalance,
    loading,
    address,
    balances,
    balance,
  }
}, {
  persist: true,
})
