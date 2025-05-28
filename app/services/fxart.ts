import type { DropItem } from '@/types'
import type { Prefix } from '@kodadot1/static'
import { isProduction } from '@/utils/env'
import { $fetch } from 'ofetch'

const BASE_URL = isProduction
  ? 'https://fxart.kodadot.workers.dev/'
  : 'https://fxart-beta.kodadot.workers.dev/'

export const DYNAMIC_METADATA = 'fxart-beta.kodadot.workers.dev/metadata/'

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

export async function getDropMintedStatus(alias: string, accountId: string) {
  return await api<DropMintedStatus>(`/drops/${alias}/accounts/${accountId}`, {
    method: 'GET',
  })
}

// export async function updateMetadata({ chain, collection, nft }) {
//   try {
//     const response = await api('/metadata/v1/dyndata/update', {
//       method: 'post',
//       body: {
//         chain,
//         collection,
//         nft,
//       },
//     })

//     return response
//   }
//   catch (error) {
//     throw new Error(
//       `[FXART::UPDATE_METADATA] ERROR: ${(error as FetchError).data}`,
//     )
//   }
// }

export interface DropCalendar {
  id: number
  name: string
  description: string
  twitter_handle: string
  date: string | null
  time: string | null
  address: string | null
  content: string | null
  supply: number | null
  royalty: number | null
  price: string | null
  holder_of: string | null
  location: string | null
  items: CalendarItem[]
  alias: string | null
  chain: Prefix | null
  creator: string | null
}

export interface CalendarItem {
  image: string
}

interface GetCalendarsQuery {
  chain?: Prefix[]
}

export async function getDropCalendar(query: GetCalendarsQuery = {}) {
  return await api<DropCalendar[]>('/calendars', {
    method: 'GET',
    query,
  })
}
