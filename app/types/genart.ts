import type { AssetHubChain } from '~/plugins/sdk.client'

export interface GenartDropItem {
  alias: string
  active: number
  created_at?: string
  start_at: string
  chain: AssetHubChain
  collection: string
  creator?: string
  price: string
}

export interface GenartListResponse {
  success: true
  data: GenartDropItem[]
  count: number
  params: {
    limit: number
    order_by: 'start_at_desc' | 'start_at_asc' | 'created_at_desc' | 'created_at_asc'
    creator: string | undefined
    collection: string | undefined
    chain: AssetHubChain
    active: number
    alias: string | undefined
  }
}
