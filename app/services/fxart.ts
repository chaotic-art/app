import type { FetchError } from 'ofetch'
import type { DropItem } from '@/types'
import { $fetch } from 'ofetch'
import { isProduction } from '@/utils/env'

const BASE_URL = isProduction
  ? 'https://fxart.kodadot.workers.dev/'
  : 'https://fxart-beta.kodadot.workers.dev/'

const api = $fetch.create({
  baseURL: BASE_URL,
})

export interface DoResult {
  sn: string
  collection: string
  chain: string
  txHash?: string
  timestamp?: string
  image?: string
  name: string
  metadata?: string
  nft?: string
}

export interface GetDropsQuery {
  limit?: number
  active?: boolean[]
  chain?: string[]
  creator?: string
  collection?: string
}

export interface DropMintedStatus {
  created_at: string
  id: number
  image: string
  metadata: string
  claimed: number
  email: string
  hash: string
}

export async function getDrops(query?: GetDropsQuery) {
  return await api<DropItem[]>('drops', {
    method: 'GET',
    query,
  })
}

export function getDropById(id: string) {
  return api<DropItem>(`/drops/${id}`)
}

export async function updateMetadata({ chain, collection, nft }: any) {
  try {
    const response = await api('/metadata/v1/dyndata/update', {
      method: 'post',
      body: {
        chain,
        collection,
        nft,
      },
    })

    return response
  }
  catch (error) {
    throw new Error(
      `[FXART::UPDATE_METADATA] ERROR: ${(error as FetchError).data}`,
    )
  }
}
