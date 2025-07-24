import type { ActionMintDrop } from './actions'
import type { BaseEvmMintParams, BaseMintParams, BaseSubstrateMintParams } from './execution'
import type { SubApi } from '@/plugins/api.client'

// Mint parameter types
// ----------------------
export type MintDropParams = BaseMintParams<ActionMintDrop>
export type SubstrateMintDropParams<T = SubApi> = BaseSubstrateMintParams<ActionMintDrop, T>
export type EvmMintDropParams = BaseEvmMintParams<ActionMintDrop>
