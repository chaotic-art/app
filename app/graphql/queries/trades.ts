import type { ResultOf } from '../client'
import { graphql } from '../client'

export const offersList = graphql(`
    query offersList($where: OfferWhereInput!, $orderBy: [OfferOrderByInput!] = [blockNumber_DESC]) {
        offers(where: $where, orderBy: $orderBy) {
        id
        expiration
        blockNumber
        price
        status
        caller
        nft {
          id
          name
          sn
          currentOwner
          image
          collection {
            id
          }
          meta {
              id
              image
              animationUrl
              name
              description
          }
        }
        desired {
          id
          name
          sn
          currentOwner
          image
          collection {
            id
          }
          meta {
              id
              image
              animationUrl
              name
              description
          }
        }
        considered {
          id
          name
          currentOwner
          image
        }
      }
    }
`)
export type OffersListData = ResultOf<typeof offersList>

export const swapList = graphql(`
    query swapsList($where: SwapWhereInput!, $orderBy: [SwapOrderByInput!] = [blockNumber_DESC]) {
        swaps(where: $where, orderBy: $orderBy) {
        id
        expiration
        blockNumber
        status
        caller
        surcharge
        price
        nft {
          id
          name
          sn
          currentOwner
          image
          collection {
            id
          }
          meta {
              id
              image
              animationUrl
              name
              description
          }
        }
        desired {
          id
          name
          sn
          currentOwner
          image
          collection {
            id
          }
          meta {
              id
              image
              animationUrl
              name
              description
          }
        }
        considered {
          id
          name
          currentOwner
          image
        }
      }
    }
`)

export type SwapListData = ResultOf<typeof swapList>

// minimal offers for offered NFT sn suggestions
export const unusedOfferedItems = graphql(`
  query unusedOfferedItems($where: OfferWhereInput!) {
    offers(where: $where) {
      nft { sn }
    }
  }
`)
export type UnusedOfferedItemsData = ResultOf<typeof unusedOfferedItems>

// highest offer by collection id
export const highestOfferByCollectionId = graphql(`
    query highestOfferByCollectionId($id: String!) {
      offers(where: {status_eq: ACTIVE, desired: {collection: {id_eq: $id}}}, orderBy: price_DESC, limit: 1) {
        expiration
        status
        price
        id
      }
    }
`)

export type HighestOfferByCollectionIdData = ResultOf<typeof highestOfferByCollectionId>

export const highestOfferByNftId = graphql(`
    query highestOfferByNftId($id: String!) {
      offers(where: {status_eq: ACTIVE, desired: {id_eq: $id}}, orderBy: price_DESC, limit: 1) {
        expiration
        status
        price
        id
      }
    }
`)

export type HighestOfferByNftIdData = ResultOf<typeof highestOfferByNftId>

export const activeOffersIdsByNftId = graphql(`
  query activeOffersIdsByNftId($id: String!) {
    items: offers(
      where: { status_eq: ACTIVE, desired: { id_eq: $id } }
      orderBy: blockNumber_DESC
    ) {
      id
    }
  }
`)

export const activeSwapsIdsByNftId = graphql(`
  query activeSwapsIdsByNftId($id: String!) {
    items: swaps(
      where: { status_eq: ACTIVE, desired: { id_eq: $id } }
      orderBy: blockNumber_DESC
    ) {
      id
    }
  }
`)
