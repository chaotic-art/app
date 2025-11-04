import { useQuery } from '@tanstack/vue-query'
import { collectionIdList } from '~/graphql/queries/collections'

export function useOwnedCollections(address: MaybeRef<string>) {
  const { $apolloClient } = useNuxtApp()
  const { currentChain } = useChain()

  return useQuery({
    queryKey: ['ownedCollections', address],
    queryFn: async () => {
      const { data } = await $apolloClient.query({
        query: collectionIdList,
        variables: {
          search: {
            nfts_some: {
              currentOwner_eq: unref(address),
            },
          },
        },
        context: { endpoint: currentChain.value },
      })

      return data?.collectionEntities.map(({ id }) => id) || []
    },
  })
}
