import type { TradeNftItem, TradeType } from '@/components/trade/types'
import { TradeTypes } from '@/components/trade/types'

export const isTradeSwap = (type: TradeType) => type === TradeTypes.Swap
export const isTradeOffer = (type: TradeType) => type === TradeTypes.Offer

export default (trade: Ref<TradeNftItem | undefined>) => {
  return {
    isSwap: computed(() => trade.value ? isTradeSwap(trade.value.type) : false),
    isOffer: computed(() => trade.value ? isTradeOffer(trade.value.type) : false),
  }
}
