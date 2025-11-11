import type { SwapSurchargeDirection } from '@/composables/onchain/useNftPallets'
import type { HighestOfferByNftIdData } from '~/graphql/queries/trades'
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OnchainCollection } from '~/services/oda'

export interface MakingOfferItem {
  id: string
  chain: AssetHubChain
  price?: string
  highestOffer?: string
  offerPrice?: string
  offerExpiration?: number
  name: string
  currentOwner: string
  collection: { id: string } & OnchainCollection
  meta?: { image: string }
  metadata: string
  sn: string | null
}

export const TradeStatuses = {
  Active: 'ACTIVE',
  Expired: 'EXPIRED',
  Withdrawn: 'WITHDRAWN',
  Accepted: 'ACCEPTED',
} as const

export type TradeStatus = typeof TradeStatuses[keyof typeof TradeStatuses]

export interface TradeToken {
  id: string
  name: string
  sn: string
  currentOwner: string
  image: string
  collection: {
    id: string
  }
  meta: Record<string, unknown>
}

export interface TradeConsidered {
  id: string
  name: string
  currentOwner: string
  image: string
}

export interface BaseTrade {
  id: string
  price: string
  expiration: string
  blockNumber: string
  status: TradeStatus
  caller: string
  nft: TradeToken
  offered: TradeToken
  desired: TradeToken | null
  considered: TradeConsidered
  createdAt: Date
  surcharge: SwapSurchargeDirection | null
}

export const TradeDesiredTokenTypes = {
  Specific: 'specific',
  AnyInCollection: 'any_in_collection',
} as const

export type TradeDesiredTokenType = typeof TradeDesiredTokenTypes[keyof typeof TradeDesiredTokenTypes]

export const TradeTypes = {
  Swap: 'swap',
  Offer: 'offer',
} as const

export type TradeType = typeof TradeTypes[keyof typeof TradeTypes]

export type Swap = BaseTrade

export type Offer = BaseTrade

type Trade = Swap | Offer

export interface TradeTarget {
  id: string
  currentOwner: string
}

export type TradeNftItem<T = Trade> = T & {
  expirationDate: Date
  type: TradeType
  desiredType: TradeDesiredTokenType
  isAnyTokenInCollectionDesired: boolean
  targets: TradeTarget[]
  isExpired: boolean
}

export type HighestNftOffer = HighestOfferByNftIdData['offers'][number]
