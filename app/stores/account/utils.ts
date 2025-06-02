import type { Chain } from '@/types'
import type { ChainVM } from '@kodadot1/static'
import type { AccountVm, SupportedAsset } from './types'
import { Chains } from '@/types'

const supportedAssets = ([
  { chain: Chains.Kusama, token: 'KSM' },
  { chain: Chains.AssetHubKusama, token: 'KSM' },
  { chain: Chains.Polkadot, token: 'DOT' },
  { chain: Chains.AssetHubPolkadot, token: 'DOT' },
  { chain: Chains.AssetHubWestend, token: 'WND' },
] as SupportedAsset[])
  .map(asset => ({
    ...asset,
    prefix: getPrefixOfChain(asset.chain),
  }))

export const vmChains = supportedAssets.reduce((acc, asset) => {
  const vm = vmOf(asset.prefix)
  acc[vm].push(asset.chain)
  return acc
}, { EVM: [], SUB: [] } as Record<ChainVM, Chain[]>)

export function getDefaultAccount(): AccountVm {
  return {
    address: '',
    chains: {},
  }
}

export function getVMSupportedAssets(vm: ChainVM) {
  return supportedAssets.filter(({ prefix }) => vmOf(prefix) === vm)
}
