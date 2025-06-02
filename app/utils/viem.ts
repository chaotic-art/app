import type { Prefix } from '@kodadot1/static'
import type { Chain } from 'viem'
import { westendAssetHub } from '@wagmi/vue/chains'

export const VIEM_CHAIN_ID_TO_PREFIX: Record<number, Prefix> = {
  [westendAssetHub.id]: 'ahw',
}

export const VIEM_PREFIX_TO_CHAIN: Partial<Record<Prefix, Chain>> = {
  ahw: westendAssetHub,
}
