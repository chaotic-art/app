import type { ChainVM } from '@kodadot1/static'

export interface WalletAccount {
  id: string // extensionId:accountAddress
  vm: ChainVM
  address: string
  isSelected: boolean
  name: string
  balance: number
}

export const WalletStates = {
  Idle: 'idle',
  ConnectionQueued: 'connectionQueued',
  ConnectionFailed: 'connectionFailed',
  Connected: 'connected',
  Connecting: 'connecting',
  Disconnecting: 'disconnecting',
  Disconnected: 'disconnected', // TODO: remove and use Idle?
} as const

export type WalletState = typeof WalletStates[keyof typeof WalletStates]

export interface WalletExtension {
  id: string
  name: string
  icon: string
  installed: boolean
  vm: ChainVM
  url: string
  source: string
  accounts: WalletAccount[]
  state: WalletState
  isSelected?: boolean
}

export const WalletStageTypes = {
  Loading: 'loading',
  Wallet: 'wallet',
  Authorization: 'authorization',
  Account: 'account',
} as const

export type WalletStageType = typeof WalletStageTypes[keyof typeof WalletStageTypes]

export interface WalletExtensionAccountPair { account: WalletAccount, extension: WalletExtension }
