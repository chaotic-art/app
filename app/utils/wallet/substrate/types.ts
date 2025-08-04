import type { InjectedExtension, PolkadotSigner } from 'polkadot-api/pjs-signer'

export const SubstrateWalletSources = {
  PolkadotJs: 'polkadot-js',
  SubWallet: 'subwallet-js',
  Talisman: 'talisman',
  Nova: 'nova-wallet',
  Math: 'mathwallet',
  Enkrypt: 'enkrypt',
  PolkaGate: 'polkagate',
  Clover: 'clover',
  Ledger: 'ledger',
} as const

export type SubstrateWalletSource = typeof SubstrateWalletSources[keyof typeof SubstrateWalletSources]

export interface SubstrateWalletAccount {
  address: string
  name?: string
  source: SubstrateWalletSource
  genesisHash?: string | null
  type?: string
  signer?: PolkadotSigner
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
  signer?: PolkadotSigner
  unsub?: () => void
}

export type SubscriptionFn = (wallets: ReadonlyArray<SubstrateWallet>) => void
