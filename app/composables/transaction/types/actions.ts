import type { Prefix } from '@kodadot1/static'
import type { NFTs } from './base'

export interface ActionMintDrop {
  interaction: typeof NFTs.MINT_DROP
  availableSerialNumbers?: string[]
  price: string | null
  collectionId: string
  urlPrefix: Prefix
}

export type Actions = ActionMintDrop
