import type { Swap, TradeNftItem, TradeType } from '@/components/trade/types'
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OdaToken, OnchainCollection } from '~/services/oda'
import { TradeTypes } from '@/components/trade/types'
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import { fetchOdaCollection, fetchOdaToken } from '~/services/oda'

export type OverviewMode = 'owner' | 'incoming'

export function useIsTradeOverview(trade: ComputedRef<TradeNftItem | undefined>) {
  const { accountId } = useAuth()
  const { isTargetOfTrade } = useIsTrade(trade, accountId)

  const mode = computed<OverviewMode>(() => isTargetOfTrade.value ? 'incoming' : 'owner')

  const isMyTrade = computed(() => mode.value === 'owner')
  const isIncomingTrade = computed(() => mode.value === 'incoming')

  return {
    isMyTrade,
    isIncomingTrade,
    mode,
  }
}

export interface ExecTxParams {
  trade: TradeNftItem
  sendItem: string
  chain: AssetHubChain
}

export const TradeTypeTx: Record<TradeType, Record<OverviewMode, (params: ExecTxParams) => void>> = {
  [TradeTypes.Swap]: {
    owner: ({ trade, chain }) => {
      const { cancelSwap } = useNftPallets()

      cancelSwap({ offeredItemId: Number(trade.offered.sn), offeredCollectionId: Number(trade.offered.collection.id), chain })
    },
    incoming: ({ chain, trade, sendItem }) => {
      const { acceptSwap } = useNftPallets()

      acceptSwap({
        receiveItem: Number(trade.offered.sn),
        receiveCollection: Number(trade.offered.collection.id),
        sendCollection: Number(trade.considered.id),
        sendItem: Number(sendItem),
        price: Number(trade.price),
        surcharge: (trade as TradeNftItem<Swap>).surcharge,
        chain,
      })
    },
  },
  [TradeTypes.Offer]: {
    owner: ({ trade, chain }) => {
      const { cancelOffer } = useNftPallets()

      cancelOffer({ offeredItemId: Number(trade.offered.sn), chain })
    },
    incoming: ({ trade, sendItem, chain }) => {
      const { acceptOffer } = useNftPallets()

      acceptOffer({
        chain,
        receiveItem: Number(trade.offered.sn),
        sendCollection: Number(trade.considered.id),
        sendItem: Number(sendItem),
        price: Number(trade.price),
      })
    },
  },
}

export type TradeDetailedToken = {
  id: string
  sn: string
  collection: OnchainCollection
} & OdaToken

export async function fetchTradeDetailedToken(id: string, chain: AssetHubChain): Promise<TradeDetailedToken> {
  const [collectionId = '', tokenId = ''] = id.split('-')

  const [nft, collection] = await Promise.all([
    fetchOdaToken(chain, collectionId, tokenId),
    fetchOdaCollection(chain, collectionId),
  ])

  return {
    id: `${collectionId}-${tokenId}`,
    sn: tokenId,
    collection,
    ...nft,
  }
}
