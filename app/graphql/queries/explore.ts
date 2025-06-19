import { graphql, type ResultOf } from '../client'

export const exploreCollections = graphql(`
    query collectionListWithSearch($first: Int!, $offset: Int, $search: [CollectionEntityWhereInput!], $orderBy: [CollectionEntityOrderByInput!] = [blockNumber_DESC], $denyList: [String!]) {
    collectionEntities(
        orderBy: $orderBy
        limit: $first
        offset: $offset
        where: {nfts_some: {burned_eq: false, issuer_not_in: $denyList}, AND: $search, metadata_isNull: false}
    ) {
        id
        metadata
        issuer
        currentOwner
        blockNumber
        name
        meta {
            image
            banner
        }
    }
    stats: collectionEntitiesConnection(
        where: {nfts_some: {burned_eq: false, issuer_not_in: $denyList}, AND: $search, metadata_isNull: false}
        orderBy: blockNumber_DESC
        ) {
            totalCount
        }
    }
`)

export type ExploreCollectionsData = ResultOf<typeof exploreCollections>
