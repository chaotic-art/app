import type { AssetHubChain } from '~/plugins/sdk.client'
import { t } from 'try'
import { fetchOdaToken } from '~/services/oda'

function getApi(prefix: AssetHubChain) {
  const { $sdk } = useNuxtApp()
  return $sdk(prefix)
}

/**
 * Get the entries for a collection
 * @param params - The parameters object
 * @param params.prefix - The prefix of the chain
 * @param params.collectionId - The ID of the collection
 * @param params.max - The maximum number of entries to return
 * @param params.excludeTokenId - The token ID to exclude from the results
 * @returns The entries for the collection
 */
export async function tokenEntries({ prefix, collectionId, max, excludeTokenId }: { prefix: AssetHubChain, collectionId: number, max?: number, excludeTokenId?: number }) {
  const api = getApi(prefix).api
  const query = await api.query.Nfts.Item.getEntries(collectionId)

  // Filter out excluded token ID if provided
  const filteredQuery = excludeTokenId
    ? query.filter((entry) => {
        const [, tokenId] = entry.keyArgs
        return tokenId !== excludeTokenId
      })
    : query

  const entries = max ? filteredQuery.slice(0, max) : filteredQuery

  const items = await Promise.all(entries.map(async (entry) => {
    const [, tokenId] = entry.keyArgs
    const [ok, err, metadata] = await t(fetchOdaToken(prefix, collectionId.toString(), tokenId.toString()))

    if (!ok) {
      console.error('Error fetching token', err)
    }

    return { ...entry, ...metadata }
  }))

  return items
}

/**
 * Get the number of minted tokens on a collection
 * @param params - The parameters object
 * @param params.prefix - The prefix of the chain
 * @param params.collectionId - The ID of the collection
 * @returns The number of minted tokens on the collection
 */
export async function mintedTokens({ prefix, collectionId }: { prefix: AssetHubChain, collectionId: number }) {
  const api = getApi(prefix).api
  const entries = await api.query.Nfts.Item.getEntries(collectionId)
  return entries.length
}

export async function accountTokenEntries({ prefix, account, collectionId }: { prefix: AssetHubChain, account: string, collectionId: number }) {
  const api = getApi(prefix).api
  const entries = await api.query.Nfts.Account.getEntries(account)

  const query = entries.filter(entry => entry.keyArgs[1] === collectionId)
  const items = await Promise.all(query.map(async (entry) => {
    const [,collectionId, tokenId] = entry.keyArgs
    const [ok, err, metadata] = await t(fetchOdaToken(prefix, collectionId.toString(), tokenId.toString()))
    if (!ok) {
      console.error('Error fetching token', err)
    }

    return { ...entry, ...metadata }
  }))

  return items
}

/**
 * Get the last item ID used on a collection
 * @param params - The parameters object
 * @param params.prefix - The prefix of the chain
 * @param params.collectionId - The ID of the collection
 * @returns The last item ID used on the collection
 */
export async function lastItemId({ prefix, collectionId }: { prefix: AssetHubChain, collectionId: number }) {
  const api = getApi(prefix).api
  const collectionItems = await api.query.Nfts.Item.getEntries(collectionId)
  const itemIds = collectionItems.map(item => item.keyArgs[1])

  return Math.max(...itemIds)
}
