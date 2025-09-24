import type { Abi } from 'viem'
import type { AssetHubChain } from '~/plugins/sdk.client'

export interface Unit {
  name: string
  value: number
}

export enum DropStatus {
  MINTING_ENDED = 'minting_ended',
  MINTING_LIVE = 'minting_live',
  COMING_SOON = 'coming_soon', // live but disabled by backend
  SCHEDULED_SOON = 'scheduled_soon', // live in < 24h
  SCHEDULED = 'scheduled', // live in > 24
  UNSCHEDULED = 'unscheduled',
}

export interface DropItem {
  // offchain (database)
  alias: string
  chain: AssetHubChain
  collection: string // collection id
  start_at?: string
  price?: string
  creator?: string

  // onchain
  max?: number
  minted: number
  name: string
  collectionName: string
  collectionDescription: string
  image: string
  banner: string
  content: string
  abi?: Abi | null

  // additional data
  dropStartTime?: Date
  isMintedOut: boolean
  isFree: boolean
  status: DropStatus
}
