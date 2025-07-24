import type { Unsubcall } from '@polkadot/extension-inject/types'
import type { InjectedExtension, KeypairType, PolkadotSigner } from 'polkadot-api/pjs-signer'

export const SubstrateWalletSources = {
  PolkadotJs: 'polkadot-js',
  SubWallet: 'subwallet-js',
  Talisman: 'talisman',
  Nova: 'nova',
  Math: 'mathwallet',
  Enkrypt: 'enkrypt',
  PolkaGate: 'polkagate',
  Clover: 'clover',
  Ledger: 'ledger',
} as const

export type SubstrateWalletSource = typeof SubstrateWalletSources[keyof typeof SubstrateWalletSources]

export const WalletProxyMap: Partial<Record<SubstrateWalletSource, SubstrateWalletSource>> = {
  [SubstrateWalletSources.Math]: SubstrateWalletSources.PolkadotJs,
  [SubstrateWalletSources.Nova]: SubstrateWalletSources.PolkadotJs,
}

export interface SubstrateWalletAccount {
  address: string
  name?: string
  source: SubstrateWalletSource
  genesisHash?: string | null
  type: KeypairType | undefined
  signer: PolkadotSigner
}

export interface SubstrateWalletMetadata {
  id: string
  name: string
  icon: string
  source: SubstrateWalletSource
  url: string
  isBrowserExtension: boolean
  isMobileWallet: boolean
}

export interface SubstrateWallet extends SubstrateWalletMetadata {
  installed: boolean
  enabled: boolean
  accounts: SubstrateWalletAccount[]
  extension?: InjectedExtension
  unsub?: Unsubcall
}

export type SubscriptionFn = (wallets: ReadonlyArray<SubstrateWallet>) => void
