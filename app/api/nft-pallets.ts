import type { Prefix } from '@kodadot1/static'
import { fetchOdaToken } from '~/services/oda'

function getApi(prefix: Prefix) {
  const { $api } = useNuxtApp()
  return $api(prefix)
}

/**
 * Get the entries for a collection
 * @param prefix - The prefix of the chain
 * @param collectionId - The ID of the collection
 * @param max - The maximum number of entries to return
 * @returns The entries for the collection
 */
export async function tokenEntries({ prefix, collectionId, max }: { prefix: Prefix, collectionId: number, max?: number }) {
  if (!isAssetHub(prefix)) {
    throw new Error('This function is only available on Asset Hub chains')
  }

  const api = await getApi(prefix)
  const query = await api.query.Nfts.Item.getEntries(collectionId)

  let entries = query

  if (max) {
    entries = entries.slice(0, max)
  }

  const items = await Promise.all(entries.map(async (entry) => {
    const { keyArgs } = entry
    const [, tokenId] = keyArgs

    const metadata = await fetchOdaToken(prefix, collectionId.toString(), tokenId.toString())

    return { ...entry, ...metadata }
  }))

  return items
}
