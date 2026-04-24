import type { CollectionsSalesData, TopCollectionsData } from '@/graphql/queries/collections'
import type { Interaction } from '@/types'
import type { AssetHubChain } from '~/types/chain'
import { collectionsSales, topCollections } from '@/graphql/queries/collections'
import { sanitizeIpfsUrl } from '@/utils/ipfs'
import {
  calculateAvgPrice,
  monthlyrangeVolume,
  monthlyVolume,
  threeMonthlyVolume,
  threeMonthRangeVolume,
  volume,
  weeklyrangeVolume,
  weeklyVolume,
} from './series'

export function proccessData(
  collectionsList: TopCollectionsData['collectionEntities'],
  collectionsSales: CollectionsSalesData['collectionsSales'],
) {
  return Promise.all(
    collectionsList.map(
      async (collection) => {
        const thisCollectionSales = collectionsSales.find(
          ({ id }) => id === collection.id,
        )
        const saleEvents = (thisCollectionSales?.sales
          .map(nft => nft.events)
          .flat() ?? []) as unknown as Interaction[]

        const image = sanitizeIpfsUrl(collection.image || '')

        return {
          ...collection,
          image,
          averagePrice: calculateAvgPrice(
            collection.volume as string,
            collection.nftCount,
          ),
          volume: volume(saleEvents),
          weeklyVolume: weeklyVolume(saleEvents),
          monthlyVolume: monthlyVolume(saleEvents),
          threeMonthVolume: threeMonthlyVolume(saleEvents),
          weeklyrangeVolume: weeklyrangeVolume(saleEvents),
          monthlyrangeVolume: monthlyrangeVolume(saleEvents),
          threeMonthlyrangeVolume: threeMonthRangeVolume(saleEvents),
        }
      },
    ),
  )
}

export function useTopCollections(limit: number, chain: MaybeRefOrGetter<AssetHubChain>) {
  const { $apolloClient } = useNuxtApp()
  const topCollectionWithVolumeList = useState<Awaited<ReturnType<typeof proccessData>>>(
    'topCollectionWithVolumeList',
    () => [],
  )
  const collectionsSalesResults = ref<CollectionsSalesData | null>(null)
  const endpoint = computed(() => toValue(chain))

  onMounted(async () => {
    const { data: topCollectionsData } = await $apolloClient.query({
      query: topCollections,
      variables: {
        orderBy: 'volume_DESC',
        limit,
        where: {
          issuer_not_in: getDenyList(endpoint.value) || [],
          volume_gt: '0',
        },
      },
      context: {
        endpoint: endpoint.value,
      },
    })

    if (topCollectionsData?.collectionEntities?.length) {
      const ids = topCollectionsData.collectionEntities.map(c => c.id)

      const result = await $apolloClient.query({
        query: collectionsSales,
        variables: { ids },
        context: {
          endpoint: endpoint.value,
        },
      })

      topCollectionWithVolumeList.value = []
      collectionsSalesResults.value = result.data

      if (
        collectionsSalesResults.value
        && topCollectionsData.collectionEntities?.length
      ) {
        topCollectionWithVolumeList.value = await proccessData(
          topCollectionsData.collectionEntities,
          collectionsSalesResults.value.collectionsSales,
        )
      }
    }
  })

  return {
    data: topCollectionWithVolumeList,
  }
}
