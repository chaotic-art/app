import type { Prefix as KodaPrefix } from '@kodadot1/static'

export type Prefix = Extract<KodaPrefix, 'ahk' | 'ksm' | 'ahp' | 'dot' | 'ahw'>

export const Chains = {
  Kusama: 'Kusama',
  AssetHubKusama: 'AssetHubKusama',
  AssetHubPolkadot: 'AssetHubPolkadot',
  Polkadot: 'Polkadot',
  AssetHubWestend: 'AssetHubWestend',
} as const

export type Chain = typeof Chains[keyof typeof Chains]

export const prefixToChainMap = {
  ahk: Chains.AssetHubKusama,
  ksm: Chains.Kusama,
  ahp: Chains.AssetHubPolkadot,
  dot: Chains.Polkadot,
  ahw: Chains.AssetHubWestend,
} as const

export const chainToPrecisionMap: Record<Chain, number> = {
  [Chains.Kusama]: 4,
  [Chains.AssetHubKusama]: 6,
  [Chains.AssetHubPolkadot]: 5,
  [Chains.Polkadot]: 4,
  [Chains.AssetHubWestend]: 5,
}

export const chainToPrefixMap = {
  [Chains.AssetHubKusama]: 'ahk',
  [Chains.Kusama]: 'ksm',
  [Chains.AssetHubPolkadot]: 'ahp',
  [Chains.Polkadot]: 'dot',
  [Chains.AssetHubWestend]: 'ahw',
} as const
