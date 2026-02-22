import type { ResultOf } from '../client'
import { graphql } from '../client'

// token activity
export const tokenActivity = graphql(`
    query tokenActivity($limit: Int, $orderBy: [EventOrderByInput!], $where: EventWhereInput) {
        events(limit: $limit, orderBy: $orderBy, where: $where) {
            id
            interaction
            meta
            timestamp
            caller
            currentOwner
        }
    }
`)
export type TokenActivityData = ResultOf<typeof tokenActivity>

export const tokenEntityById = graphql(`
    query tokenEntityById($id: String!) {
        token: nftEntityById(id: $id) {
            rarityRank
            rarityScore
            rarityPercentile
            rarityTier
        }
    }
`)
export type TokenEntityByIdData = ResultOf<typeof tokenEntityById>
