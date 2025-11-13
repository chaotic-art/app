import type { TradeNftItem, TradeToken } from '@/components/trade/types'
import { SwapStep } from '@/components/swap/types'

const SWAP_ROUTE_NAME_STEP_MAP = {
  'chain-swap': SwapStep.COUNTERPARTY,
  'chain-swap-id': SwapStep.DESIRED,
  'chain-swap-id-offer': SwapStep.OFFERED,
  'chain-swap-id-review': SwapStep.REVIEW,
}

const COLLECTION_SWAP_ROUTE_NAME_STEP_MAP = {
  'chain-collection-id-swaps': SwapStep.COUNTERPARTY,
  'chain-swap-collection-id': SwapStep.DESIRED,
  'chain-swap-id-offer': SwapStep.OFFERED,
  'chain-swap-id-review': SwapStep.REVIEW,
}

export const ATOMIC_SWAP_PAGES = [
  'chain-swap-id',
  'chain-swap-collection-id',
  'chain-swap-id-offer',
  'chain-swap-id-review',
]

export const getRouteNameStepMap = (isCollectionSwap?: boolean) => isCollectionSwap ? COLLECTION_SWAP_ROUTE_NAME_STEP_MAP : SWAP_ROUTE_NAME_STEP_MAP

export function getSwapStepRouteName(step: SwapStep, isCollectionSwap?: boolean) {
  const routeNameStepMap = getRouteNameStepMap(isCollectionSwap)
  const index = Object.values(routeNameStepMap).findIndex(name => name === step)
  return `${Object.keys(routeNameStepMap)[index]}___en`
}

export function getSwapStep(swap: AtomicSwap): SwapStep {
  if (swap.blockNumber) {
    return SwapStep.CREATED
  }

  if (!swap.desired.length) {
    return SwapStep.DESIRED
  }

  if (!swap.offered.length || swap.offered.length !== swap.desired.length) {
    return SwapStep.OFFERED
  }

  return SwapStep.REVIEW
}

export function getStepItemsKey(step: SwapStep) {
  if (step === SwapStep.DESIRED) {
    return 'desired'
  }

  if (step === SwapStep.OFFERED) {
    return 'offered'
  }
}

export function navigateToSwap(swap: AtomicSwap) {
  navigateTo({
    name: getSwapStepRouteName(SwapStep.DESIRED, swap.isCollectionSwap),
    params: { id: swap.counterparty },
    query: { swapId: swap.id },
  })
}

export function tradeToSwapItem(token: TradeToken): SwapItem {
  return {
    id: token.id,
    collectionId: Number(token.collection.id),
    sn: Number(token.sn), // todo change type to number
    name: token.name,
    meta: token.meta,
  }
}

export function counterSwap(trade: TradeNftItem) {
  const { currentChain } = useChain()

  const withFields: CrateSwapWithFields = {
    desired: [tradeToSwapItem(trade.offered)],
  }

  if (trade.desired) {
    withFields.offered = [tradeToSwapItem(trade.desired)]
  }

  if (trade.surcharge) {
    Object.assign(withFields, {
      surcharge: {
        amount: trade.price,
        direction: trade.surcharge,
      },
    })
  }

  const swap = useAtomicSwapStore().createSwap(trade.caller, currentChain.value, withFields)

  navigateToSwap(swap)
}

export function getRouteName(route: string) {
  return route.split('___')[0] || ''
}
