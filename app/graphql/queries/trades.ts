import type { ResultOf } from '../client'
import { graphql } from '../client'

// token activity
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
