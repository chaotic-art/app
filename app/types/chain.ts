export const Chains = {
  Kusama: 'Kusama',
  AssetHubKusama: 'AssetHubKusama',
  AssetHubPolkadot: 'AssetHubPolkadot',
  Polkadot: 'Polkadot',
  AssetHubWestend: 'AssetHubWestend',
  Base: 'Base',
} as const

export type Chain = typeof Chains[keyof typeof Chains]

export const prefixToChainMap = {
  ahk: Chains.AssetHubKusama,
  ksm: Chains.Kusama,
  ahp: Chains.AssetHubPolkadot,
  dot: Chains.Polkadot,
  ahw: Chains.AssetHubWestend,
  base: Chains.Base,
} as const

export const chainToPrecisionMap: Record<Chain, number> = {
  [Chains.Kusama]: 4,
  [Chains.AssetHubKusama]: 6,
  [Chains.AssetHubPolkadot]: 5,
  [Chains.Polkadot]: 4,
  [Chains.AssetHubWestend]: 5,
  [Chains.Base]: 4,
}

export const chainToPrefixMap = {
  [Chains.AssetHubKusama]: 'ahk',
  [Chains.Kusama]: 'ksm',
  [Chains.AssetHubPolkadot]: 'ahp',
  [Chains.Polkadot]: 'dot',
  [Chains.AssetHubWestend]: 'ahw',
  [Chains.Base]: 'base',
} as const
