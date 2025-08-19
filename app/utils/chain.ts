import type { ChainProperties, ChainVM, Prefix } from '@kodadot1/static'
import type { SupportedChain } from '~/plugins/sdk.client'
import { CHAINS } from '@kodadot1/static'

export function chainPropListOf(prefix: Prefix): ChainProperties {
  return CHAINS[prefix]
}

export function vmOf(prefix: Prefix): ChainVM {
  return chainPropListOf(prefix).vm
}

// this is static config. for onchain data use getChainSpec() from utils/api/substrate.ts
export const chainSpec: Record<SupportedChain, { name: string, tokenDecimals: number, tokenSymbol: string, ss58Format: number }> = {
  ahp: {
    name: 'Polkadot Asset Hub',
    tokenDecimals: 10,
    tokenSymbol: 'DOT',
    ss58Format: 0,
  },
  ahk: {
    name: 'Kusama Asset Hub',
    tokenDecimals: 12,
    tokenSymbol: 'KSM',
    ss58Format: 2,
  },
  ahpas: {
    name: 'Paseo Asset Hub',
    tokenDecimals: 10,
    tokenSymbol: 'PAS',
    ss58Format: 0,
  },
  dot: {
    name: 'Polkadot',
    tokenDecimals: 10,
    tokenSymbol: 'DOT',
    ss58Format: 0,
  },
  ksm: {
    name: 'Kusama',
    tokenDecimals: 12,
    tokenSymbol: 'KSM',
    ss58Format: 2,
  },
}
