import type { SupportedPapiChain as SubstrateChain } from '~/plugins/sdk.client'

export type { SupportedPapiChain as SubstrateChain } from '~/plugins/sdk.client'

export type AssetHubChain = Extract<SubstrateChain, 'ahp' | 'ahk' | 'ahpas'>

export type EvmChain = 'polkadot' | 'kusama' | 'polkadot-testnet'

/**
 * Chains exposed directly in app routes and user-facing flows.
 * This excludes relay chains e.g. (dot, ksm)
 */
export type AppChain = AssetHubChain | EvmChain

/** Any chain the app may work with, including relay chains. */
export type Chain = SubstrateChain | EvmChain

export type ChainVm = 'SUB' | 'EVM'
