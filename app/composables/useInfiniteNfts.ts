import type { ExploreNftsData } from '~/graphql/queries/explore'
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { NftRarity } from '~/types/rarity'
import { exploreNfts } from '~/graphql/queries/explore'
import { isRarityTier } from '~/types/rarity'
import { getDenyList } from '~/utils/prefix'

type NftEntity = ExploreNftsData['tokenEntities'][0]

interface UseInfiniteNftsOptions {
  pageSize?: number
  distance?: number
  search?: string
  owner?: string
  issuer?: string
  variables?: Record<string, any> // Allow any additional GraphQL variables
  endpoint?: AssetHubChain
}

export function useInfiniteNfts(options: UseInfiniteNftsOptions = {}) {
  const {
    pageSize = 40,
    distance = 300,
    search = '',
    owner,
    issuer,
    variables = {},
    endpoint = 'ahp',
  } = options

  const orderBy = Array.isArray(variables.orderBy) ? variables.orderBy : [variables.orderBy]

  if (orderBy && orderBy.length === 1) {
    if (orderBy[0] === 'blockNumber_DESC') {
      variables.orderBy = ['blockNumber_DESC', 'sn_DESC']
    }
    else if (orderBy[0] === 'blockNumber_ASC') {
      variables.orderBy = ['blockNumber_ASC', 'sn_ASC']
    }
    else if (orderBy[0] === 'rarityRank_ASC') {
      variables.orderBy = ['rarityRank_ASC_NULLS_LAST', 'rarityScore_DESC_NULLS_LAST', 'sn_ASC']
    }
    else if (orderBy[0] === 'rarityRank_DESC') {
      variables.orderBy = ['rarityRank_DESC_NULLS_LAST', 'rarityScore_ASC_NULLS_LAST', 'sn_DESC']
    }
    else if (orderBy[0] === 'rarityPercentile_ASC') {
      variables.orderBy = ['rarityPercentile_ASC_NULLS_LAST', 'rarityScore_DESC_NULLS_LAST', 'sn_ASC']
    }
    else if (orderBy[0] === 'rarityPercentile_DESC') {
      variables.orderBy = ['rarityPercentile_DESC_NULLS_LAST', 'rarityScore_ASC_NULLS_LAST', 'sn_DESC']
    }
  }

  const infiniteQuery = useInfiniteQuery<ExploreNftsData, NftEntity>({
    query: exploreNfts,
    pageSize,
    distance,
    variables: {
      denyList: getDenyList(endpoint) || [], // TODO: handle asset hub chains
      name: search || undefined,
      owner: owner || undefined,
      issuer: issuer || undefined,
      ...variables,
    },
    extractData: data => data.tokenEntities,
    extractTotal: data => data.stats.totalCount,
    placeholderCount: 18,
    endpoint,
  })

  // Transform display items for the template with proper typing
  const nfts = computed(() => {
    return infiniteQuery.displayItems.value.map((item, index) => {
      // Type guard for placeholder items
      if (item.isPlaceholder) {
        return {
          id: item.id,
          name: item.name,
          tokenId: index,
          collectionId: index,
          chain: endpoint,
          image: item.image,
          isPlaceholder: true,
          price: null,
          currentOwner: null,
          rarity: {
            rarityRank: null,
            rarityScore: null,
            rarityPercentile: null,
            rarityTier: null,
            rarityTotalItems: null,
          } satisfies NftRarity,
        }
      }

      // Real NFT data
      const nft = item as NftEntity & { isPlaceholder: false }
      const [collectionId, tokenId] = String(nft.id).split('-').map(Number)

      return {
        ...nft,
        id: nft.id,
        name: nft.name || 'Untitled NFT',
        tokenId: tokenId || 0,
        collectionId: collectionId || 0,
        chain: endpoint,
        image: nft.meta?.image || nft.image,
        isPlaceholder: false,
        rarity: {
          rarityRank: nft.rarityRank,
          rarityScore: nft.rarityScore,
          rarityPercentile: nft.rarityPercentile,
          rarityTier: isRarityTier(nft.rarityTier) ? nft.rarityTier : null,
          rarityTotalItems: null,
        } satisfies NftRarity,
      }
    })
  })

  return {
    ...infiniteQuery,
    nfts,
  }
}
