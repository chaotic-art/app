export const Chains = {
  Kusama: 'Kusama',
  AssetHubKusama: 'AssetHubKusama',
  AssetHubPolkadot: 'AssetHubPolkadot',
  Polkadot: 'Polkadot',
  AssetHubWestend: 'AssetHubWestend',
} as const

export type Chain = typeof Chains[keyof typeof Chains]
