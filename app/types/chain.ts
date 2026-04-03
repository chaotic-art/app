import type { SupportedPapiChain as SubstrateChain } from '~/plugins/sdk.client'

export type { SupportedPapiChain as SubstrateChain } from '~/plugins/sdk.client'

export type AssetHubChain = Extract<SubstrateChain, 'ahp' | 'ahk' | 'ahpas'>

export type EvmChain = 'polkadot' | 'kusama' | 'polkadot-testnet'

export type Chain = SubstrateChain | EvmChain

export type ChainVm = 'SUB' | 'EVM'
