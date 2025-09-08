import type { Prefix } from '@kodadot1/static'
import type { Abi } from 'viem'
import type { AssetHubChain } from '~/plugins/sdk.client'

const api = $fetch.create({ baseURL: 'https://oda.chaotic.art', retry: 3 })

export interface OnchainCollection {
  metadata?: {
    name?: string
    image?: string
    description?: string
    generative_uri?: string
    banner?: string
  }
  metadata_uri: string | null
  supply?: string
  claimed?: string
  owner?: string
  floor: number | null
}

export function fetchOdaCollection(chain: AssetHubChain, address: string) {
  return api<OnchainCollection>(`/v1/${chain}/collection/${address}`)
}

export function refreshOdaCollection(chain: AssetHubChain, address: string) {
  return api(`/v1/${chain}/collection/${address}`, { method: 'DELETE' })
}

interface OdaCollectionOwners {
  uniquerOwnersCount: number
  minted: number
  owners: Record<string, number>
}

export function fetchOdaCollectionOwners(chain: AssetHubChain, address: string) {
  return api<OdaCollectionOwners>(`/v1/${chain}/collection/${address}/owners`)
}

export interface NFTMetadata {
  name?: string
  description?: string
  image?: string
  animation_url?: string
  attributes?: Record<string, string>[]
  mime_type?: string
  animation_mime_type?: string
}

export interface OdaToken {
  metadata: NFTMetadata | null
  metadata_uri?: string
  price: string | null
  owner: string | null
}

export function fetchOdaToken(chain: AssetHubChain, address: string, tokenId: string) {
  return api<OdaToken>(`/v1/${chain}/collection/${address}/token/${tokenId}`)
}

export function refreshOdaTokenMetadata(chain: AssetHubChain, address: string, tokenId: string) {
  return api<OdaToken>(`/v1/${chain}/collection/${address}/token/${tokenId}`, {
    method: 'DELETE',
  })
}

export function refreshOdaCollectionTokensMetadata(chain: Prefix, address: string) {
  return api(`/v1/${chain}/collection/${address}/tokens`, {
    method: 'DELETE',
  })
}

interface OdaMimeType {
  mime_type: string
}

export function fetchMimeType(uri: string) {
  return api<OdaMimeType>(`/v1/mime-type/${uri}`)
}

export function fetchOdaCollectionAbi(chain: Prefix, address: string) {
  return api<Abi | null>(`/v1/${chain}/collection/${address}/abi`)
}
