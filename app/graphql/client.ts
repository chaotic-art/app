import type { introspection } from './ahp-env.js'
import { initGraphQLTada } from 'gql.tada'

export const graphql = initGraphQLTada<{
  introspection: introspection
  scalars: {
    BigInt: string
  }
}>()

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada'
export { readFragment } from 'gql.tada'
