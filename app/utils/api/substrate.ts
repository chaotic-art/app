import type { SupportedChain } from '~/plugins/sdk.client'
import { formatBalance } from 'dedot/utils'

export async function getChainSpec(chainPrefix: SupportedChain) {
  const { $sdk } = useNuxtApp()
  const { client } = $sdk(chainPrefix)
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

export async function getBalance(chainPrefix: SupportedChain, address: string) {
  const { $sdk } = useNuxtApp()
  const { api } = $sdk(chainPrefix)

  const balance = await api.query.System.Account.getValue(address)

  const spec = chainSpec[chainPrefix]
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
