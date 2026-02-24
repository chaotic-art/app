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

export const collectionAnalyticsMarketEvents = graphql(`
  query collectionAnalyticsMarketEvents($id: String!, $limit: Int, $timestampLte: DateTime) {
    events(
      limit: $limit
      orderBy: [timestamp_DESC]
      where: {
        interaction_in: [BUY, LIST, UNLIST]
        timestamp_lte: $timestampLte
        nft: { collection: { id_eq: $id } }
      }
    ) {
      id
      interaction
      meta
      caller
      timestamp
      nft {
        id
        name
        image
        meta {
          image
          name
        }
      }
    }
  }
`)
export type CollectionAnalyticsMarketEventsData = ResultOf<typeof collectionAnalyticsMarketEvents>

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
            issuer
            currentOwner
        }
    }
`)
export type TopCollectionsData = ResultOf<typeof topCollections>

// collections owners by ids (minimal shape)
export const collectionsOwnersByIds = graphql(`
  query collectionsOwnersByIds($ids: [String!]) {
    collections: collectionEntities(where: { id_in: $ids }) {
      id
      nfts { id currentOwner }
    }
  }
`)
export type CollectionsOwnersByIdsData = ResultOf<typeof collectionsOwnersByIds>

export const collectionIdList = graphql(`
    query collectionIdList(
      $search: CollectionEntityWhereInput
      $orderBy: [CollectionEntityOrderByInput!] = [blockNumber_DESC]
    ) {
      collectionEntities(
        orderBy: $orderBy
        where: $search
      ) {
          id
      }
    }
`)

export type CollectionIdListData = ResultOf<typeof collectionIdList>

export const nftAttributesListByCollection = graphql(`
  query nftAttributesListByCollection($id: String!) {
    nfts: nftEntities(where: {collection: {id_eq: $id}, burned_eq: false }) {
      id
      rarityTier
      rarityScore
      rarityPercentile
      rarityRank
      meta {
        attributes {
          trait
          value
        }
      }
    }
  }
`)

export type NftAttributesListByCollectionData = ResultOf<typeof nftAttributesListByCollection>
