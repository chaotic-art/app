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

export enum TradeStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  WITHDRAWN = 'WITHDRAWN',
  ACCEPTED = 'ACCEPTED',
}

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

// TODO to object as const
export enum TradeDesiredTokenType {
  SPECIFIC,
  ANY_IN_COLLECTION,
}

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
