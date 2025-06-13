import type { Prefix } from '@kodadot1/static'
import type { Chain } from '@/types/chain'
import { Chains } from '@/types/chain'

const chainToPrefix: Partial<Record<Chain, Prefix>> = {
  [Chains.Polkadot]: 'dot',
  [Chains.Kusama]: 'ksm',
  [Chains.AssetHubKusama]: 'ahk',
  [Chains.AssetHubPolkadot]: 'ahp',
  [Chains.AssetHubWestend]: 'ahw',
}

const prefixToChain: Partial<Record<Prefix, Chain>> = {
  dot: Chains.Polkadot,
  ksm: Chains.Kusama,
  ahk: Chains.AssetHubKusama,
  ahp: Chains.AssetHubPolkadot,
  ahw: Chains.AssetHubWestend,
}

export const getPrefixOfChain = (chain: Chain): Prefix => chainToPrefix[chain] as Prefix

export const getChainOfPrefix = (prefix: Prefix): Chain => prefixToChain[prefix] as Chain
