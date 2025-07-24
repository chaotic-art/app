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

export const chainToPrefixMap = {
  [Chains.AssetHubKusama]: 'ahk',
  [Chains.Kusama]: 'ksm',
  [Chains.AssetHubPolkadot]: 'ahp',
  [Chains.Polkadot]: 'dot',
  [Chains.AssetHubWestend]: 'ahw',
} as const
