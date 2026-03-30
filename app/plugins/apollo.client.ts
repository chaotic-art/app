import type { AssetHubChain } from '~/types/chain'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { getGraphqlEndpointChain, isChain } from '~/utils/chain'

export const GRAPHQL_ENDPOINTS: Record<AssetHubChain, string> = {
  ahk: URLS.graphql.ahk,
  ahp: URLS.graphql.ahp,
  ahpas: URLS.graphql.ahpas,
}

export default defineNuxtPlugin(() => {
  const customUri = new HttpLink({
    uri: ({ getContext }) => {
      const { endpoint } = getContext()

      if (typeof endpoint !== 'string' || !isChain(endpoint)) {
        throw new Error(`Apollo GraphQL request received invalid chain endpoint: ${String(endpoint)}`)
      }

      const graphqlEndpoint = getGraphqlEndpointChain(endpoint)

      if (!graphqlEndpoint) {
        throw new Error(`No GraphQL endpoint configured for chain: ${endpoint}`)
      }

      return GRAPHQL_ENDPOINTS[graphqlEndpoint]
    },
  })

  const client = new ApolloClient({
    link: customUri,
    cache: new InMemoryCache(),
  })

  return {
    provide: {
      apolloClient: client,
    },
  }
})
