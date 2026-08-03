import type { Address } from 'viem'
import type { SupportedChain } from '~/plugins/sdk.client'
import { isAddress } from 'viem'
import {
  CHAIN_KUSAMA_MAINNET,
  CHAIN_POLKADOT_MAINNET,
  CHAIN_POLKADOT_TESTNET,
  getPublicClient,
} from '~/utils/viem'

const POLKAVM_CHAIN_BY_PREFIX = {
  ahp: CHAIN_POLKADOT_MAINNET,
  ahk: CHAIN_KUSAMA_MAINNET,
  ahpas: CHAIN_POLKADOT_TESTNET,
} as const

interface GetBalanceParams {
  address: string
  chain: SupportedChain
}

interface GetBalanceResult {
  address: string
  balance: bigint
  symbol: string
  decimals: number
  tokenName: string
}

export type GetBalancesResult = (GetBalanceResult & { chain: SupportedChain })[]

export default function () {
  const getSubstrateBalance = async ({ address, chain }: GetBalanceParams): Promise<GetBalanceResult> => {
    const { $sdk } = useNuxtApp()

    const formattedAddress = formatAddress({ address, prefix: chain })

    const balance = await $sdk(chain).api.query.System.Account.getValue(formattedAddress)

    return {
      address: formattedAddress,
      balance: balance.data.free,
      symbol: chainSpec[chain].tokenSymbol,
      decimals: chainSpec[chain].tokenDecimals,
      tokenName: chainSpec[chain].name,
    }
  }

  const getEvmBalance = async ({ address, chain }: GetBalanceParams): Promise<GetBalanceResult> => {
    const chainConfig = POLKAVM_CHAIN_BY_PREFIX[chain as keyof typeof POLKAVM_CHAIN_BY_PREFIX] ?? CHAIN_POLKADOT_MAINNET
    const client = getPublicClient(chainConfig.id)
    const balance = await client.getBalance({ address: address as Address })

    return {
      address,
      balance,
      symbol: chainConfig.nativeCurrency.symbol,
      decimals: chainConfig.nativeCurrency.decimals,
      tokenName: chainConfig.name,
    }
  }

  const getBalance = async ({ address, chain }: GetBalanceParams): Promise<GetBalanceResult> => {
    if (isAddress(address) && ['ahp', 'ahk', 'ahpas'].includes(chain)) {
      return getEvmBalance({ address, chain })
    }

    if (chain === 'ahp' || chain === 'ahk' || chain === 'dot' || chain === 'ksm' || chain === 'ahpas') {
      return getSubstrateBalance({ address, chain })
    }

    return { address, balance: 0n, symbol: '', decimals: 0, tokenName: '' }
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
