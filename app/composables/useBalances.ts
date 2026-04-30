import type { Address } from 'viem'
import type { Chain, EvmChain, SubstrateChain } from '~/types'
import { isAddress } from 'viem'
import { isEvmChain, isSubstrateChain } from '@/utils/chain'
import { getPublicClient, getViemChainSpec } from '~/utils/viem'

interface GetBalanceParams {
  address: string
  chain: Chain
}

interface GetBalanceResult {
  address: string
  balance: bigint
  symbol: string
  decimals: number
  tokenName: string
}

export type GetBalancesResult = (GetBalanceResult & { chain: Chain })[]

export default function () {
  const emptyBalance = ({ address, chain }: GetBalanceParams): GetBalanceResult => ({
    address,
    balance: 0n,
    symbol: chainConfig[chain].tokenSymbol,
    decimals: chainConfig[chain].tokenDecimals,
    tokenName: chainConfig[chain].name,
  })

  const getSubstrateBalance = async ({ address, chain }: { address: string, chain: SubstrateChain }): Promise<GetBalanceResult> => {
    const { $sdk } = useNuxtApp()

    const formattedAddress = formatAddress({ address, chain })

    const balance = await $sdk(chain).api.query.System.Account.getValue(formattedAddress)

    return {
      address: formattedAddress,
      balance: balance.data.free,
      symbol: chainConfig[chain].tokenSymbol,
      decimals: chainConfig[chain].tokenDecimals,
      tokenName: chainConfig[chain].name,
    }
  }

  const getEvmBalance = async ({ address, chain }: { address: string, chain: EvmChain }): Promise<GetBalanceResult> => {
    const viemChain = getViemChainSpec(chain)
    const client = getPublicClient(viemChain.id)
    const balance = await client.getBalance({ address: address as Address })

    return {
      address,
      balance,
      symbol: viemChain.nativeCurrency.symbol,
      decimals: viemChain.nativeCurrency.decimals,
      tokenName: viemChain.name,
    }
  }

  const getBalance = async ({ address, chain }: GetBalanceParams): Promise<GetBalanceResult> => {
    if (isEvmChain(chain)) {
      if (!isAddress(address)) {
        return emptyBalance({ address, chain })
      }

      return getEvmBalance({ address, chain })
    }

    if (isSubstrateChain(chain)) {
      if (isAddress(address)) {
        return emptyBalance({ address, chain })
      }

      return getSubstrateBalance({ address, chain })
    }

    return emptyBalance({ address, chain })
  }

  const getBalances = async (accounts: GetBalanceParams[]): Promise<GetBalancesResult> => {
    const balances = await Promise.all(accounts.map(async ({ address: genericAddress, chain }) => {
      const { address, balance, symbol, decimals, tokenName } = await getBalance({ address: genericAddress, chain })

      return {
        balance,
        address,
        chain,
        symbol,
        decimals,
        tokenName,
      }
    }))

    return balances
  }

  return {
    getBalances,
    getBalance,
  }
}
