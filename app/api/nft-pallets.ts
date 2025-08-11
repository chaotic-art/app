import type { Prefix } from '@kodadot1/static'
import { t } from 'try'
import { fetchOdaToken } from '~/services/oda'

function getApi(prefix: Prefix) {
  const { $api } = useNuxtApp()
  return $api(prefix)
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
export async function tokenEntries({ prefix, collectionId, max, excludeTokenId }: { prefix: Prefix, collectionId: number, max?: number, excludeTokenId?: number }) {
  if (!isAssetHub(prefix)) {
    throw new Error('This function is only available on Asset Hub chains')
  }

  const api = getApi(prefix)
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
