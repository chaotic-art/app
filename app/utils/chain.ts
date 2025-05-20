import type { ChainProperties, ChainVM, Prefix } from '@kodadot1/static'
import { CHAINS } from '@kodadot1/static'

export function chainPropListOf(prefix: Prefix): ChainProperties {
  return CHAINS[prefix]
}

export function vmOf(prefix: Prefix): ChainVM {
  return chainPropListOf(prefix).vm
}

export function ss58Of(prefix: Prefix): number {
  return chainPropListOf(prefix).ss58Format
}
