import type { Chain } from '@/types/chain'
import type { ChainVM, Prefix } from '@kodadot1/static'
import { Chains } from '@/types/chain'

export type SubTokenKey = 'DOT' | 'KSM'
export type EvmTokenKey = 'ETH'
export type TokenKey = SubTokenKey | EvmTokenKey

export interface TokenDetail {
  balance: string
}

export interface ChainData {
  address: string
  assets: Partial<Record<TokenKey, TokenDetail>>
}

export interface AccountVm {
  address: string
  chains: Partial<Record<Chain, ChainData>>
}

interface SupportedAsset {
  chain: Chain
  token: TokenKey
}

const supportedAssets = ([
  { chain: Chains.Kusama, token: 'KSM' },
  { chain: Chains.AssetHubKusama, token: 'KSM' },
  { chain: Chains.Polkadot, token: 'DOT' },
  { chain: Chains.AssetHubPolkadot, token: 'DOT' },
  { chain: Chains.Base, token: 'ETH' },
] as SupportedAsset[])
  .map(asset => ({
    ...asset,
    prefix: getPrefixOfChain(asset.chain),
  }))

function getDefaultAccount(): AccountVm {
  return {
    address: '',
    chains: {},
  }
}

function getVMSupportedAssets(vm: ChainVM) {
  return supportedAssets.filter(({ prefix }) => vmOf(prefix) === vm)
}

export const useAccountStore = defineStore('account', () => {
  const { vm, prefix } = useChain()

  const loading = ref(false)
  const accounts = ref<Record<ChainVM, AccountVm>>({
    SUB: getDefaultAccount(),
    EVM: getDefaultAccount(),
  })

  const getVmAccount = (vm: ChainVM) => {
    return accounts.value[vm].chains[getChainOfPrefix(prefix.value)]
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

    const assets = Object.fromEntries(
      supportedTokens.map(({ token, prefix }) => [
        token,
        {
          balance: String(balances.find(b => b.prefix === prefix)?.balance || '0'),
        } as TokenDetail,
      ]),
    )

    return { address, assets }
  }

  const updateAccountChainsBalances = ({ vm, balances }: { vm: ChainVM, balances: GetBalancesResult }) => {
    accounts.value[vm].chains = Object.fromEntries(
      Object.entries(accounts.value[vm].chains).map(([chain, { address }]) => [
        chain,
        getUpdatedChainData({ vm, chain: chain as Chain, address, balances }),
      ]),
    )
  }

  const fetchBalance = async () => {
    const { getBalances } = useBalances()

    loading.value = true

    try {
      await Promise.all(Object.entries(accounts.value).map(async ([vm, account]) => {
        const accounts = Object.entries(account.chains).map(([chain, { address }]) => ({
          prefix: getPrefixOfChain(chain as Chain),
          address,
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
        getVMSupportedAssets(vm)
          .map(({ chain, prefix }) => [chain, {
            address: vm === 'SUB' ? formatAddress({ address, prefix }) : address,
            assets: {},
          }]),
      ),
    }
  }

  return {
    accounts,
    supportedAssets,
    fetchBalance,
    loading,
    address,
    setAuth,
    balances,
    balance,
  }
}, {
  persist: true,
})
