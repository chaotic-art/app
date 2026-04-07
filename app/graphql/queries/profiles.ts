import type { ResultOf } from '../client'
import { graphql } from '../client'

export const allEvents = graphql(`
    query allEvents($where: EventWhereInput) {
      events(where: $where) {
        meta
        interaction
        blockNumber
        timestamp
        currentOwner
        caller
        id
        nft {
          id
          sn
          name
          metadata
          collection {
            id
            name
          }

          meta {
            id
            image
            animationUrl
          }
        }
      }
    }
`)

export type AllEventsData = ResultOf<typeof allEvents>
