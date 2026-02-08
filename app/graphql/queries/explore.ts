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
        floor
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
        $price_isNull: Boolean
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
                price_isNull: $price_isNull
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
            price
            currentOwner
            rarityScore
            rarityRank
            rarityPercentile
            rarityTier
            meta {
                id
                image
                animationUrl
                description
                kind
            }
        }
        stats: nftEntitiesConnection(
            orderBy: blockNumber_DESC
            where: {
                issuer_not_in: $denyList
                currentOwner_eq: $owner
                issuer_eq: $issuer
                name_containsInsensitive: $name
                price_isNull: $price_isNull
                collection: {
                    id_in: $collections
                }
                burned_eq: false
                metadata_isNull: false
                AND: $search
            }
        ) {
            totalCount
        }
    }
`)

export type ExploreNftsData = ResultOf<typeof exploreNfts>
