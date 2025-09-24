import type { Abi } from 'viem'
import type { GenartDropItem } from './genart'

export enum DropStatus {
  MINTING_ENDED = 'minting_ended',
  MINTING_LIVE = 'minting_live',
  COMING_SOON = 'coming_soon', // live but disabled by backend
  SCHEDULED_SOON = 'scheduled_soon', // live in < 24h
  SCHEDULED = 'scheduled', // live in > 24
  UNSCHEDULED = 'unscheduled',
}

export interface DropItem extends GenartDropItem {
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
