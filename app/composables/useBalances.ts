import type { SupportedChain } from '~/plugins/sdk.client'

interface GetBalanceParams {
  address: string
  prefix: SupportedChain
}

interface GetBalanceResult {
  address: string
  balance: bigint
  symbol: string
}

export type GetBalancesResult = (GetBalanceResult & { prefix: SupportedChain })[]

export default function () {
  const getSubstrateBalance = async ({ address, prefix }: GetBalanceParams): Promise<GetBalanceResult> => {
    const { $sdk } = useNuxtApp()

    const formattedAddress = formatAddress({ address, prefix })

    const balance = await $sdk(prefix).api.query.System.Account.getValue(formattedAddress)

    return { address: formattedAddress, balance: balance.data.free, symbol: chainSpec[prefix as SupportedChain].tokenSymbol }
  }

  // const getEvmBalance = async ({ address, prefix }: GetBalanceParams): Promise<GetBalanceResult> => {
  //   const { value: balance, symbol } = await accountBalance(useNuxtApp().$wagmi.adapter.wagmiConfig, {
  //     address: address as Address,
  //     blockTag: 'latest',
  //     chainId: VIEM_PREFIX_TO_CHAIN[prefix]?.id,
  //   })

  //   return { address, balance, symbol }
  // }

  const getBalance = async ({ address, prefix }: GetBalanceParams): Promise<GetBalanceResult> => {
    if (prefix === 'ahp' || prefix === 'ahk' || prefix === 'dot' || prefix === 'ksm') {
      return getSubstrateBalance({ address, prefix })
    }

    // return getEvmBalance({ address, prefix })
    return { address, balance: 0n, symbol: '' }
  }

  const getBalances = async (accounts: GetBalanceParams[]): Promise<GetBalancesResult> => {
    const balances = await Promise.all(accounts.map(async ({ address: genericAddress, prefix }) => {
      const { address, balance, symbol } = await getBalance({ address: genericAddress, prefix })

      return {
        balance,
        address,
        prefix,
        symbol,
      }
    }))

    return balances
  }

  return {
    getBalances,
    getBalance,
  }
}
