import type { Chain } from '@/types/chain'

export type SubTokenKey = 'DOT' | 'KSM'
export type EvmTokenKey = 'ETH' | 'WND'
export type TokenKey = SubTokenKey | EvmTokenKey

export interface TokenDetail {
  balance: string
  nativeBalance: string
}

export interface ChainData {
  address: string
  assets: Partial<Record<TokenKey, TokenDetail>>
}

export interface AccountVm {
  address: string
  chains: Partial<Record<Chain, ChainData>>
}

export interface SupportedAsset {
  chain: Chain
  token: TokenKey
}
