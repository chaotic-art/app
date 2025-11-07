import type { TradeNftItem } from '@/components/trade/types'
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OdaToken, OnchainCollection } from '~/services/oda'
import { TradeType } from '@/components/trade/types'
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
  [TradeType.SWAP]: {
    owner: () => {},
    incoming: () => {},
  },
  [TradeType.OFFER]: {
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
