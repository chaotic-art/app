import type { AssetHubChain } from '~/plugins/sdk.client'

export function getOfferCollectionId(chain: AssetHubChain) {
  switch (chain) {
    case 'ahk':
      return 464
    case 'ahp':
      return 174
    default:
      return 0
  }
}

export const OFFER_MINT_PRICE = 5e8
export const BLOCKS_PER_HOUR = 300
export const BLOCKS_PER_DAY = BLOCKS_PER_HOUR * 24 // 12sec /block --> 300blocks/hr
