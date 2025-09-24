import type { ResultOf } from '../client'
import { graphql } from '../client'

export const allEventsByProfile = graphql(`
    query allEventsByProfile($id: String) {
      events(where: { caller_eq: $id, OR: { currentOwner_eq: $id } }) {
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

export type AllEventsByProfileData = ResultOf<typeof allEventsByProfile>
