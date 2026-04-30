import { useQuery } from '@tanstack/vue-query'
import { getGraphqlEndpointChain } from '@/utils/chain'
import { collectionIdList } from '~/graphql/queries/collections'

export function useOwnedCollections(address: MaybeRef<string>) {
  const { $apolloClient } = useNuxtApp()
  const { currentChain } = useChain()
  const graphqlEndpoint = computed(() => getGraphqlEndpointChain(currentChain.value))

  return useQuery({
    queryKey: ['ownedCollections', address, graphqlEndpoint],
    queryFn: async () => {
      if (!graphqlEndpoint.value) {
        return []
      }

      const { data } = await $apolloClient.query({
        query: collectionIdList,
        variables: {
          search: {
            nfts_some: {
              currentOwner_eq: unref(address),
            },
          },
        },
        context: { endpoint: graphqlEndpoint.value },
      })

      return data?.collectionEntities.map(({ id }) => id) || []
    },
  })
}
