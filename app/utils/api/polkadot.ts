import type { SupportedChain } from '~/plugins/sdk.client'

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
  }
}
