import type { Prefix } from '@kodadot1/static'
import { getLastIndexUsedOnChain } from '@/composables/transaction/mintToken/utils'

const BASE_URL = isProduction
  ? 'https://dyndata.koda.art'
  : 'https://dyndata-beta.koda.art'

const api = $fetch.create({
  baseURL: BASE_URL,
})

// store latest IDs for each collection
const latestIdsMap = new Map<string, number>()

export async function generateIdAssethub(collectionId: number, prefix?: Prefix) {
  // 237 is the latest drops collection id to handle backwards compatibility
  if (collectionId <= 273 && prefix) {
    const mapKey = `${prefix}-${collectionId}`

    // Always check the chain for the latest ID
    const api = useNuxtApp().$api(prefix)
    const lastIdFromChain = await getLastIndexUsedOnChain(api, collectionId)
    const currentStoredId = latestIdsMap.get(mapKey) || 0

    // Use the larger of the two values to ensure we don't create duplicates
    const currentId = Math.max(lastIdFromChain, currentStoredId)
    const nextId = currentId + 1

    // Store the new ID
    latestIdsMap.set(mapKey, nextId)
    return nextId.toString()
  }

  return (await api('/generate-id')) as string
}

export async function generateId() {
  return (await api('/generate-id')) as string
}

export function setDyndataUrl({ chain, collection, nft }: { chain: string, collection: string | number, nft: number | string }) {
  const metadata = `https://dyndata.koda.art/v1/metadata/${chain}/${collection}/${nft}`
  const image = `https://dyndata.koda.art/v1/image/${chain}/${collection}/${nft}`

  return {
    metadata,
    image,
  }
}
