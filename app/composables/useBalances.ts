import type { Prefix } from '@kodadot1/static'
import type { Address } from 'viem'
import { getBalance as accountBalance } from '@wagmi/core'

interface BalanceParams {
  address: string
  prefix: Prefix
}

interface BalanceResult {
  address: string
  balance: bigint
}

export default function () {
  const getSubstrateBalance = async ({ address, prefix }: BalanceParams): Promise<BalanceResult> => {
    const { $api } = useNuxtApp()

    const formattedAddress = formatAddress({ address, prefix })

    const balance = await $api(prefix as any).query.System.Account.getValue(formattedAddress)

    return { address: formattedAddress, balance: balance.data.free }
  }

  const getEvmBalance = async ({ address, prefix }: BalanceParams): Promise<BalanceResult> => {
    const { value: balance } = await accountBalance(useNuxtApp().$wagmi.adapter.wagmiConfig, {
      address: address as Address,
      blockTag: 'latest',
      chainId: VIEM_PREFIX_TO_CHAIN[prefix]?.id,
    })

    return { address, balance }
  }

  const getBalance = async ({ address, prefix }: BalanceParams): Promise<BalanceResult> => {
    return execByVm({
      SUB: () => getSubstrateBalance({ address, prefix }),
      EVM: () => getEvmBalance({ address, prefix }),
    }, { prefix })
  }

  const getBalances = async (accounts: BalanceParams[]): Promise<{ native: bigint, address: string, prefix: Prefix }[]> => {
    const balances = await Promise.all(accounts.map(async ({ address: genericAddress, prefix }) => {
      const { address, balance: native } = await getBalance({ address: genericAddress, prefix })

      return {
        native,
        address,
        prefix,
      }
    }))

    return balances
  }

  return {
    getBalances,
  }
}
