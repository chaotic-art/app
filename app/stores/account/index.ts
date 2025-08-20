import type { ChainVM, Prefix } from '@kodadot1/static'
import type { AccountVm, ChainData, TokenDetail, TokenKey } from './types'
import type { Chain } from '@/types/chain'
import type { SupportedChain } from '~/plugins/sdk.client'
import format from '@/utils/format/balance'
import { getDefaultAccount, getVMSupportedAssets, vmChains } from './utils'

export const useAccountStore = defineStore('account', () => {
  const { prefix } = usePrefix()
  const { vm } = useVm()

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
        const nativeToken = chainSpec[prefix as SupportedChain].tokenSymbol as TokenKey

        if (chainData.assets[nativeToken]) {
          result[prefix] = chainData.assets[nativeToken].nativeBalance
        }
      }
    }

    return result
  })

  const balance = computed(() => balances.value[prefix.value])

  const getAuthAddress = (vm: ChainVM) => {
    return accounts.value[vm]?.address
  }

  const getAuthSignature = (vm: ChainVM) => {
    return accounts.value[vm]?.authSignature
  }

  const getTokenDetailFromBalance = ({ prefix, balance }: { prefix: SupportedChain, balance: bigint | string }): TokenDetail => {
    const nativeBalance = String(balance || '0')
    const formattedBalance = format(nativeBalance, chainSpec[prefix].tokenDecimals, false)

    return {
      balance: formattedBalance,
      nativeBalance,
    }
  }

  const updateChainDataWithBalance = ({ vm, address, balance, prefix }: { vm: ChainVM, address: string, balance: bigint, prefix: SupportedChain }): ChainData => {
    const supportedTokens = getVMSupportedAssets(vm).filter(({ prefix: tokenPrefix }) => tokenPrefix === prefix)

    const assets = Object.fromEntries(
      supportedTokens.map(({ token }) => [
        token,
        getTokenDetailFromBalance({ prefix, balance }),
      ]),
    )

    return { address, assets }
  }

  const fetchBalance = async () => {
    const { getBalance } = useBalances()

    loading.value = true

    const accountsToFetch = Object.entries(accounts.value)
      .filter(([_, account]) => Boolean(account.address))
      .map(([vm, account]) => {
        return getVMSupportedAssets(vm as ChainVM).map(asset => ({
          prefix: asset.prefix,
          address: getChainAddress({ chain: asset.chain, address: account.address }),
          chain: asset.chain,
          vm: vmOf(asset.prefix),
        }))
      })
      .flat()

    let fetchedCount = 0

    for (const { address, chain, vm, prefix } of accountsToFetch) {
      const { balance } = await getBalance({
        prefix,
        address,
      })

      // make sure account is still connected
      if (accounts.value[vm].address) {
        accounts.value = {
          ...accounts.value,
          [vm]: {
            ...accounts.value[vm],
            chains: {
              ...accounts.value[vm].chains,
              [chain]: updateChainDataWithBalance({
                vm,
                address,
                balance,
                prefix: prefix as SupportedChain,
              }),
            },
          },
        }
      }

      fetchedCount++

      if (fetchedCount === accountsToFetch.length) {
        loading.value = false
      }
    }
  }

  const setAuth = async ({ vm, address, authSignature }: { vm: ChainVM, address: string, authSignature?: string }) => {
    accounts.value[vm] = {
      address,
      chains: Object.fromEntries(
        vmChains[vm]
          .map(chain => [chain, {
            address: getChainAddress({ chain, address }),
            assets: {},
          }]),
      ),
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
    fetchBalance,
    loading,
    address,
    balances,
    balance,
    getAuthAddress,
    getAuthSignature,
  }
}, {
  persist: true,
})
