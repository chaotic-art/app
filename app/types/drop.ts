import type { Prefix } from '@kodadot1/static'
import type { Abi } from 'viem'

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

type DropType = 'paid' | 'free' | 'holder'

export interface DropItem {
  // offchain (database)
  id: string
  chain: Prefix
  alias: string
  collection: string // collection id
  type: DropType
  disabled: number
  start_at?: string
  holder_of?: string
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
  isUnlimited: boolean
  status: DropStatus
}
