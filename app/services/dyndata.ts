import type { AssetHubChain } from '~/plugins/sdk.client'
import { $fetch } from 'ofetch'

const api = $fetch.create({
  baseURL: URLS.services.dyndata,
})

export async function generateIdAssethub(collectionId: number, prefix?: AssetHubChain) {
  const id = await api(`/generate-id/${prefix}/${collectionId}`)
  return Number(id) + 1
}

export function setDyndataUrl({ chain, collection, nft }: { chain: string, collection: string | number, nft: number | string }) {
  const metadata = `${URLS.services.dyndata}/v1/metadata/${chain}/${collection}/${nft}`
  const image = `${URLS.services.dyndata}/v1/image/${chain}/${collection}/${nft}`

  return {
    metadata,
    image,
  }
}
