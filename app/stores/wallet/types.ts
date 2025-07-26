import type { ChainVM } from '@kodadot1/static'
import type { PolkadotSigner } from 'polkadot-api'

export interface WalletAccount {
  id: `${string}:${string}`
  vm: ChainVM
  address: string
  icon?: string
  name?: string
  signer?: Promise<PolkadotSigner | undefined>
}

export const WalletStates = {
  Idle: 'idle',
  AuthorizationQueued: 'authorizationQueued',
  AuthorizationFailed: 'authorizationFailed',
  Authorizing: 'authorizing', // popup opening, requesting permission
  Authorized: 'authorized', // user approved accounts
  Connecting: 'connecting', // setting up subscriptions/technical connection
  Connected: 'connected', // fully connected and ready
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
