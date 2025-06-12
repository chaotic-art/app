import type { ChainVM } from '@kodadot1/static'

export interface WalletExtension {
  id: string
  name: string
  icon: string
  installed: boolean
  vm: ChainVM
  connected: boolean
  url: string
  source: string
}
