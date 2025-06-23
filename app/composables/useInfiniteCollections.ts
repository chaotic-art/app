import type { ExploreCollectionsData } from '~/graphql/queries/explore'
import { exploreCollections } from '~/graphql/queries/explore'
import { getDenyList } from '~/utils/prefix'

type CollectionEntity = ExploreCollectionsData['collectionEntities'][0]

interface UseInfiniteCollectionsOptions {
  pageSize?: number
  distance?: number
  search?: any[]
  variables?: Record<string, any> // Allow any additional GraphQL variables
}

export function useInfiniteCollections(options: UseInfiniteCollectionsOptions = {}) {
  const { prefix } = usePrefix()

  const {
    pageSize = 40,
    distance = 300,
    search = [],
    variables = {},
  } = options

  const infiniteQuery = useInfiniteQuery<ExploreCollectionsData, CollectionEntity>({
    query: exploreCollections,
    pageSize,
    distance,
    variables: {
      denyList: getDenyList(prefix.value) || [],
      search,
      ...variables,
    },
    extractData: data => data.collectionEntities,
    extractTotal: data => data.stats.totalCount,
    placeholderCount: 8,
  })

  // Transform display items for the template with proper typing
  const collections = computed(() => {
    return infiniteQuery.displayItems.value.map((item) => {
      // Type guard for placeholder items
      if (item.isPlaceholder) {
        return {
          id: item.id,
          name: item.name,
          image: item.image,
          issuer: '',
          currentOwner: '',
          metadata: null,
          isPlaceholder: true,
        }
      }

      // Real collection data
      const collection = item as CollectionEntity & { isPlaceholder: false }
      return {
        id: collection.id,
        name: collection.name || 'Untitled Collection',
        image: collection.meta?.image || '',
        issuer: collection.issuer,
        currentOwner: collection.currentOwner,
        metadata: collection.metadata,
        isPlaceholder: false,
      }
    })
  })

  return {
    ...infiniteQuery,
    collections,
  }
}
