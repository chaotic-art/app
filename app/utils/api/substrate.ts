import type { SubstrateChain } from '~/types/chain'
import { formatBalance } from 'dedot/utils'
import { chainConfig } from '@/utils/chain'

export async function getChainSpec(chain: SubstrateChain) {
  const { $sdk } = useNuxtApp()
  const { client } = $sdk(chain)
  const chainSpec = await client.getChainSpecData()
  const tokenDecimals: number = chainSpec.properties.tokenDecimals ?? 12
  const tokenSymbol: string = chainSpec.properties.tokenSymbol ?? 'DOT'

  return {
    decimals: tokenDecimals,
    symbol: tokenSymbol,
    name: chainSpec.name,
    ss58Format: chainSpec.properties.ss58Format,
  }
}

export async function getBalance(chain: SubstrateChain, address: string) {
  const { $sdk } = useNuxtApp()
  const { api } = $sdk(chain)

  const balance = await api.query.System.Account.getValue(address)

  const spec = chainConfig[chain]
  const tokenDecimals = spec.tokenDecimals
  const tokenSymbol = spec.tokenSymbol

  const freeBalance = balance.data.free.toString()
  const freeBalanceFormatted = formatBalance(freeBalance, { decimals: tokenDecimals, symbol: tokenSymbol })

  const usd = tokenToUsd(Number(freeBalance), tokenDecimals, tokenSymbol)
  const usdNumeric = usd ? Number(usd.replace('$', '')) : 0

  return {
    freeBalance,
    freeBalanceFormatted,
    tokenName: spec.name,
    tokenSymbol,
    usd,
    usdNumeric,
  }
}

export async function getExistentialDeposit(chain: SubstrateChain) {
  const { $sdk } = useNuxtApp()
  const { api } = $sdk(chain)

  const existentialDeposit = await api.constants.Balances.ExistentialDeposit()

  return existentialDeposit
}
