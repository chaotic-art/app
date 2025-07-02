import type { Prefix } from '@kodadot1/static'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { INDEXERS as GRAPHQL_ENDPOINTS } from '@kodadot1/static'

export default defineNuxtPlugin(() => {
  const customUri = new HttpLink({
    uri: ({ getContext }) => {
      const { endpoint } = getContext()
      return GRAPHQL_ENDPOINTS[endpoint as Prefix || 'ahp']
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
