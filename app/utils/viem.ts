import type { Prefix } from '@kodadot1/static'
import type { Chain } from 'viem'
import { base } from '@wagmi/vue/chains'

export const VIEM_CHAIN_ID_TO_PREFIX: Record<number, Prefix> = {
  [base.id]: 'base',
}

export const VIEM_PREFIX_TO_CHAIN: Partial<Record<Prefix, Chain>> = {
  base,
}
