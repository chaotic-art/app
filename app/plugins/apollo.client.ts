import type { AssetHubChain } from './sdk.client'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export const GRAPHQL_ENDPOINTS: Record<Exclude<AssetHubChain, 'ahpas'>, string> = {
  ahk: 'https://ahk.gql.api.kodadot.xyz/',
  ahp: 'https://ahp.gql.api.kodadot.xyz/',
}

export default defineNuxtPlugin(() => {
  const customUri = new HttpLink({
    uri: ({ getContext }) => {
      const { endpoint } = getContext()
      return GRAPHQL_ENDPOINTS[endpoint as Exclude<AssetHubChain, 'ahpas'> || 'ahp']
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
