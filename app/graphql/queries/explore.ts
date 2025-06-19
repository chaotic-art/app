import { graphql, type ResultOf } from '../client'

export const exploreCollections = graphql(`
    query collectionListWithSearch($first: Int!, $offset: Int, $search: [CollectionEntityWhereInput!], $orderBy: [CollectionEntityOrderByInput!] = [blockNumber_DESC], $denyList: [String!]) {
    collectionEntities(
        orderBy: $orderBy
        limit: $first
        offset: $offset
        where: {nfts_some: {burned_eq: false, issuer_not_in: $denyList}, AND: $search, metadata_isNull: false}
    ) {
        ...collection
        ...collectionDetails
        nfts(where: {burned_eq: false}) {
            id
            metadata
            name
            price
            burned
            currentOwner
            events(where: {interaction_eq: BUY}) {
                meta
            }
        }
    }
    stats: collectionEntitiesConnection(
        where: {nfts_some: {burned_eq: false, issuer_not_in: $denyList}, AND: $search, metadata_isNull: false}
        orderBy: blockNumber_DESC
        ) {
            totalCount
        }
    }

    fragment collection on CollectionEntity {
        id
        metadata
        issuer
        currentOwner
        blockNumber
    }

    fragment collectionDetails on CollectionEntity {
        name
        meta {
            image
            banner
        }
    }
`)

export type ExploreCollectionsData = ResultOf<typeof exploreCollections>
