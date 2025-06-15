import type { ChainVM } from '@kodadot1/static'

export interface WalletAccount {
  vm: ChainVM
  address: string
  isSelected: boolean
  name: string
  balance: number
  icon: string
}

export const WalletStates = {
  Idle: 'idle',
  ConnectionQueued: 'connectionQueued',
  ConnectionFailed: 'connectionFailed',
  Connected: 'connected',
  Connecting: 'connecting',
  Disconnecting: 'disconnecting',
  Disconnected: 'disconnected',
} as const

export type WalletState = typeof WalletStates[keyof typeof WalletStates]

export interface WalletExtension {
  id: string
  name: string
  icon: string
  installed: boolean
  vm: ChainVM
  connected: boolean // TODO: remove
  url: string
  source: string
  accounts: WalletAccount[]
  state: WalletState
}

export const WalletStageTypes = {
  Loading: 'loading',
  Wallet: 'wallet',
  Authorization: 'authorization',
  Account: 'account',
} as const

export type WalletStageType = typeof WalletStageTypes[keyof typeof WalletStageTypes]
