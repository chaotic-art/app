import type { ResultOf } from '../client'
import { graphql } from '../client'

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

export const exploreNfts = graphql(`
    query tokenListWithSearch(
        $first: Int!
        $offset: Int
        $price_gte: Float
        $price_gt: Float
        $price_lte: Float
        $owner: String
        $issuer: String
        $denyList: [String!]
        $collections: [String!]
        $name: String
        $orderBy: [NFTEntityOrderByInput!]
        $search: [NFTEntityWhereInput!]
    ) {
        tokenEntities: nftEntities(
            limit: $first
            offset: $offset
            orderBy: $orderBy
            where: {
                issuer_not_in: $denyList
                currentOwner_eq: $owner
                issuer_eq: $issuer
                name_containsInsensitive: $name
                collection: {
                    id_in: $collections
                }
                burned_eq: false
                metadata_isNull: false
                AND: $search
            }
        ) {
            id
            name
            image
            media
            metadata
            meta {
                id
                image
                animationUrl
                description
                kind
            }
        }
        tokenEntityCount(
            owner: $owner
            issuer: $issuer
            denyList: $denyList
            price_gte: $price_gte
            price_gt: $price_gt
            price_lte: $price_lte
            collections: $collections
            name: $name
        ) {
            totalCount
        }
    }
`)

export type ExploreNftsData = ResultOf<typeof exploreNfts>
