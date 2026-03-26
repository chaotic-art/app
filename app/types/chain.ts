import type { SupportedChain as SubstrateChain } from '~/plugins/sdk.client'

// tood: move type here
export type { SupportedChain as SubstrateChain } from '~/plugins/sdk.client'

export type EvmChain = 'polkadot' | 'kusama' | 'polkadot-testnet'

export type Chain = SubstrateChain | EvmChain

export type ChainVm = 'SUB' | 'EVM'

// export type ChainKind = 'substrate' | 'contract'
