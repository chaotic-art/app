import type { Prefix } from '@kodadot1/static'
import type { Address } from 'viem'
import { getBalance as accountBalance } from '@wagmi/core'

interface GetBalanceParams {
  address: string
  prefix: Prefix
}

interface GetBalanceResult {
  address: string
  balance: bigint
}

export type GetBalancesResult = (GetBalanceResult & { prefix: Prefix })[]

export default function () {
  const getSubstrateBalance = async ({ address, prefix }: GetBalanceParams): Promise<GetBalanceResult> => {
    const { $api } = useNuxtApp()

    const formattedAddress = formatAddress({ address, prefix })

    const balance = await $api(prefix).query.System.Account.getValue(formattedAddress)

    return { address: formattedAddress, balance: balance.data.free }
  }

  const getEvmBalance = async ({ address, prefix }: GetBalanceParams): Promise<GetBalanceResult> => {
    const { value: balance } = await accountBalance(useNuxtApp().$wagmi.adapter.wagmiConfig, {
      address: address as Address,
      blockTag: 'latest',
      chainId: VIEM_PREFIX_TO_CHAIN[prefix]?.id,
    })

    return { address, balance }
  }

  const getBalance = async ({ address, prefix }: GetBalanceParams): Promise<GetBalanceResult> => {
    return execByVm({
      SUB: () => getSubstrateBalance({ address, prefix }),
      EVM: () => getEvmBalance({ address, prefix }),
    }, { prefix })
  }

  const getBalances = async (accounts: GetBalanceParams[]): Promise<GetBalancesResult> => {
    const balances = await Promise.all(accounts.map(async ({ address: genericAddress, prefix }) => {
      const { address, balance } = await getBalance({ address: genericAddress, prefix })

      return {
        balance,
        address,
        prefix,
      }
    }))

    return balances
  }

  return {
    getBalances,
    getBalance,
  }
}
