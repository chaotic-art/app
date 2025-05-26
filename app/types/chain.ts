export const Chains = {
  Kusama: 'Kusama',
  AssetHubKusama: 'AssetHubKusama',
  AssetHubPolkadot: 'AssetHubPolkadot',
  Polkadot: 'Polkadot',
  Base: 'Base',
} as const

export type Chain = typeof Chains[keyof typeof Chains]
