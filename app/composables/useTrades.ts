import type { BaseTrade, Offer, Swap, TradeNftItem, TradeTarget } from '@/components/trade/types'
import type { OffersListData } from '~/graphql/queries/trades'
import { addSeconds, subSeconds } from 'date-fns'
import {
  TradeDesiredTokenType,
  TradeStatus,
  TradeType,
} from '@/components/trade/types'
import { BLOCKS_PER_HOUR } from '@/composables/onchain/utils'
import { collectionsOwnersByIds } from '~/graphql/queries/collections'
import { offersList } from '~/graphql/queries/trades'
// import swapsList from '@/queries/subsquid/general/swapsList.graphql'

interface CollectionWithTokenOwners {
  id: string
  nfts: {
    id: string
    currentOwner: string
  }[]
  isExpired: boolean
}

export const TRADES_QUERY_MAP: Record<TradeType, { queryDocument: typeof offersList, dataKey: string }> = {
  [TradeType.SWAP]: {
    queryDocument: offersList, // TODO change
    dataKey: 'swaps',
  },
  [TradeType.OFFER]: {
    queryDocument: offersList,
    dataKey: 'offers',
  },
}

const SECONDS_PER_BLOCK = 3600 / BLOCKS_PER_HOUR

export interface UseTradesParams {
  where?: MaybeRef<Record<string, unknown> | string>
  limit?: number
  disabled?: ComputedRef<boolean>
  type?: TradeType
  minimal?: boolean
  orderBy?: string[]
}

export default function ({
  where = {},
  limit = 100,
  disabled = computed(() => false),
  type = TradeType.SWAP,
  minimal = false,
  orderBy = ['blockNumber_DESC'],
}: UseTradesParams) {
  const { queryDocument, dataKey } = TRADES_QUERY_MAP[type]
  const { $apolloClient } = useNuxtApp()

  const items = ref<TradeNftItem[]>([])
  const targetsOfTrades = ref<Map<string, TradeTarget[]>>()
  const ownersSubscription = ref(() => { })

  const { currentChain } = useChain()
  const currentBlock = useCurrentBlock()
  const fetching = ref(true)
  const data = ref<OffersListData>()

  const fetch = async () => {
    fetching.value = true

    const response = await $apolloClient.query({
      query: queryDocument,
      variables: {
        where: unref(where) as any,
        limit,
        orderBy: orderBy as any,
      },
      context: {
        endpoint: currentChain.value,
      },
    })

    data.value = response.data
    fetching.value = false
  }

  watchSyncEffect(async () => {
    if (disabled.value) {
      return
    }

    await fetch()
  })

  const dataItems = computed<Offer[] | Swap[]>(() => data.value?.[dataKey] || [])
  const hasTargetsOfTrades = computed(() => Boolean(targetsOfTrades.value))
  const tradeKeys = computed<string>(() => dataItems.value.map(item => item.id).join('-'))
  const needsToSubscribe = computed(() => minimal ? false : !hasTargetsOfTrades.value)
  const loading = computed(() => !currentBlock.value || fetching.value || needsToSubscribe.value)

  const subscribeToTargetsOfTrades = (trades: BaseTrade[]) => {
    ownersSubscription.value = useSubscriptionGraphql({
      query: collectionsOwnersByIds,
      variables: { ids: trades.map(item => item.considered.id) },
      onChange: ({ data: { collections } }) => {
        const map = new Map()

        const collectionMap: Record<string, CollectionWithTokenOwners['nfts']> = Object.fromEntries(
          collections.map(collection => [collection.id, collection.nfts]),
        )

        trades.forEach((trade) => {
          const tradeDesired = trade.desired
          map.set(trade.id, tradeDesired
            ? [collectionMap[tradeDesired.collection.id].find(nft => nft.id === tradeDesired.id)]
            : collectionMap[trade.considered.id])
        })

        targetsOfTrades.value = map
      },
    })
  }

  if (!minimal) {
    watch([tradeKeys, () => Boolean(data.value)], ([newTradeKeys, hasFetched], [oldTradeKeys]) => {
      const hasSubscription = targetsOfTrades.value !== undefined
      const tradeKeysChanged = newTradeKeys !== oldTradeKeys

      if (hasFetched && (!hasSubscription || tradeKeysChanged)) {
        ownersSubscription.value()
        targetsOfTrades.value = undefined
        subscribeToTargetsOfTrades(dataItems.value)
      }
    })
  }

  watchEffect(() => {
    if (needsToSubscribe.value || !currentBlock.value) {
      return
    }

    items.value = dataItems.value.map((trade) => {
      const desiredType = trade.desired ? TradeDesiredTokenType.SPECIFIC : TradeDesiredTokenType.ANY_IN_COLLECTION

      return {
        ...trade,
        expirationDate: addSeconds(new Date(), ((Number(trade.expiration) - currentBlock.value) * SECONDS_PER_BLOCK)),
        offered: trade.nft,
        desiredType,
        isAnyTokenInCollectionDesired: desiredType === TradeDesiredTokenType.ANY_IN_COLLECTION,
        // Check block number to handle trades that are expired but not yet updated in indexer
        // @see https://github.com/kodadot/stick/blob/9eac12938c47bf0e66e93760231208e4249d8637/src/mappings/utils/cache.ts#L127
        isExpired: trade.status === TradeStatus.EXPIRED || currentBlock.value > Number(trade.expiration),
        type,
        targets: targetsOfTrades.value?.get(trade.id) || [],
        createdAt: subSeconds(new Date(), ((currentBlock.value - Number(trade.blockNumber)) * SECONDS_PER_BLOCK)),
      } as TradeNftItem
    })
  })

  return {
    items,
    loading,
    refetch: fetch,
  }
}
