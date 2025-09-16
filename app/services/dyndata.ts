import type { AssetHubChain } from '~/plugins/sdk.client'
import { $fetch } from 'ofetch'

const api = $fetch.create({
  baseURL: 'https://dyndata.chaotic.art',
})

export async function generateIdAssethub(collectionId: number, prefix?: AssetHubChain) {
  return (await api(`/generate-id/${prefix}/${collectionId}`)) as string
}

export function setDyndataUrl({ chain, collection, nft }: { chain: string, collection: string | number, nft: number | string }) {
  const metadata = `https://dyndata.chaotic.art/v1/metadata/${chain}/${collection}/${nft}`
  const image = `https://dyndata.chaotic.art/v1/image/${chain}/${collection}/${nft}`

  return {
    metadata,
    image,
  }
}
