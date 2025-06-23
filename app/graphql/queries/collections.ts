import type { ResultOf } from '../client'
import { graphql } from '../client'

// collections sales
export const collectionsSales = graphql(`
    query collectionsSales($ids: [String!]) {
        collectionsSales: collectionEntities(where: {id_in: $ids}) {
            id
            sales: nfts(where: { events_some: { interaction_eq: BUY }, collection: { id_in: $ids } }) {
                events(where: { interaction_eq: BUY }) {
                    id,
                    meta
                    caller
                    timestamp
                    blockNumber
                    interaction
                }
            }
        }
    }
`)
export type CollectionsSalesData = ResultOf<typeof collectionsSales>

// top collections
export const topCollections = graphql(`
    query topCollections(
        $limit: Int
        $orderBy: CollectionEntityOrderByInput = volume_DESC
        $where: CollectionEntityWhereInput = { volume_gt: "0" }
    ) {
        collectionEntities(orderBy: [$orderBy], limit: $limit, where: $where) {
            id
            name
            image
            media
            volume
            metadata
            floor
            nftCount
            ownerCount: distribution
        }
    }
`)
export type TopCollectionsData = ResultOf<typeof topCollections>
