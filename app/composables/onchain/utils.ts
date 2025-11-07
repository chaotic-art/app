import type { AssetHubApi, AssetHubChain } from '~/plugins/sdk.client'

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

// see https://wiki.polkadot.com/learn/learn-async-backing/
export const BLOCKS_PER_HOUR = 600
export const BLOCKS_PER_DAY = BLOCKS_PER_HOUR * 24 // 6sec /block --> 600blocks/hr

/**
 * Returns the current relay head height as seen from the parachain via ValidationData.
 * We use this for UI time math because our indexer stores trade heights in RELAY domain.
 */
export async function getRelayNow(api: AssetHubApi): Promise<number> {
  const vdata = await api.query.ParachainSystem.ValidationData.getValue()
  return Number(vdata?.relay_parent_number ?? 0)
}
