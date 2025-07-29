import type { ChainProperties, ChainVM, Prefix } from '@kodadot1/static'
import type { Chain } from '@/types/chain'
import { CHAINS } from '@kodadot1/static'

export function chainPropListOf(prefix: Prefix): ChainProperties {
  return CHAINS[prefix]
}

export function vmOf(prefix: Prefix): ChainVM {
  return chainPropListOf(prefix).vm
}

export function blockExplorerOf(prefix: Prefix): string {
  return chainPropListOf(prefix).blockExplorer || ''
}

export function ss58Of(prefix: Prefix): number {
  return chainPropListOf(prefix).ss58Format
}

export function tokenSymbolOf<T = string>(prefix: Prefix): T {
  return chainPropListOf(prefix).tokenSymbol as T
}

export function decimalsOf(prefix: Prefix): number {
  return chainPropListOf(prefix).tokenDecimals
}

export const vmOfChain = (chain: Chain): ChainVM => vmOf(getPrefixOfChain(chain)!)
