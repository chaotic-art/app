import type { Prefix } from '@kodadot1/static'

export enum Chain {
  KUSAMA = 'Kusama',
  ASSETHUBKUSAMA = 'AssetHubKusama',
  ASSETHUBPOLKADOT = 'AssetHubPolkadot',
  POLKADOT = 'Polkadot',
  BASE = 'Base',
}

export interface TeleportChain {
  prefix: Prefix
  chain: Chain
  name: string
}

export interface TeleportTransition {
  source: TeleportChain | null
  destination: TeleportChain
  amount: number
  amountFormatted: string
  amountUsd: string
  token: string
  txFees: number
}

export const allowedTransitions = {
  [Chain.KUSAMA]: [Chain.ASSETHUBKUSAMA],
  [Chain.ASSETHUBKUSAMA]: [Chain.KUSAMA],
  [Chain.POLKADOT]: [Chain.ASSETHUBPOLKADOT],
  [Chain.ASSETHUBPOLKADOT]: [Chain.POLKADOT],
}

export const chainToPrefixMap: Record<Chain, Prefix> = {
  [Chain.KUSAMA]: 'ksm',
  [Chain.ASSETHUBKUSAMA]: 'ahk',
  [Chain.ASSETHUBPOLKADOT]: 'ahp',
  [Chain.POLKADOT]: 'dot',
  [Chain.BASE]: 'base',
}

export const prefixToChainMap: Partial<Record<Prefix, Chain>> = {
  ksm: Chain.KUSAMA,
  ahk: Chain.ASSETHUBKUSAMA,
  ahp: Chain.ASSETHUBPOLKADOT,
  dot: Chain.POLKADOT,
  base: Chain.BASE,
}

export type Currency = 'KSM' | 'DOT' | 'ETH'

export function getChainCurrency(chain: Chain): Currency | undefined {
  switch (chain) {
    case Chain.KUSAMA:
    case Chain.ASSETHUBKUSAMA:
      return 'KSM'
    case Chain.POLKADOT:
    case Chain.ASSETHUBPOLKADOT:
      return 'DOT'
  }
}

export const chainToPrecisionMap: Record<Chain, number> = {
  [Chain.KUSAMA]: 4,
  [Chain.ASSETHUBKUSAMA]: 6,
  [Chain.ASSETHUBPOLKADOT]: 5,
  [Chain.BASE]: 5,
  [Chain.POLKADOT]: 4,
}
