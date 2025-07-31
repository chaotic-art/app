import type { ChainVM, Prefix } from '@kodadot1/static'
import { dotHubDenyList, ksmHubDenyList } from '@/utils/constants'

export function getDenyList(prefix: string): string[] | undefined {
  switch (prefix) {
    case 'ahk':
      return ksmHubDenyList
    case 'ahp':
      return dotHubDenyList
    default:
      return undefined
  }
}

export const DEFAULT_PREFIX_MAP: Record<ChainVM, Prefix> = {
  EVM: 'ahw',
  SUB: 'ahp',
}

export const chainPrefixes: Prefix[] = ['ahp', 'ahk']
