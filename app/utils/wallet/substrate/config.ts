import type { SubstrateWalletMetadata, SubstrateWalletSource } from './types'
import { isMobileDevice } from '@/utils/environment'
import { SubstrateWalletSources } from './types'

export const WalletRegistry: Record<SubstrateWalletSource, SubstrateWalletMetadata> = {
  [SubstrateWalletSources.PolkadotJs]: {
    id: SubstrateWalletSources.PolkadotJs,
    name: 'Polkadot.js',
    icon: '/partners/logo-polkadot-js.png',
    source: SubstrateWalletSources.PolkadotJs,
    url: 'https://polkadot.js.org/extension/',
    isBrowserExtension: true,
    isMobileWallet: false,
  },
  [SubstrateWalletSources.SubWallet]: {
    id: SubstrateWalletSources.SubWallet,
    name: 'SubWallet',
    icon: '/partners/logo-subwallet.svg',
    source: SubstrateWalletSources.SubWallet,
    url: 'https://chrome.google.com/webstore/detail/subwallet/onhogfjeacnfoofkfgppdlbmlmnplgbn?hl=en&authuser=0',
    isBrowserExtension: true,
    isMobileWallet: true,
  },
  [SubstrateWalletSources.Talisman]: {
    id: SubstrateWalletSources.Talisman,
    name: 'Talisman',
    icon: '/partners/logo-talisman.svg',
    source: SubstrateWalletSources.Talisman,
    url: 'https://app.talisman.xyz/spiritkeys',
    isBrowserExtension: true,
    isMobileWallet: false,
  },
  [SubstrateWalletSources.Nova]: {
    id: SubstrateWalletSources.Nova,
    name: 'Nova',
    icon: '/partners/logo-nova.png',
    source: SubstrateWalletSources.Nova,
    url: 'https://novawallet.io/',
    isBrowserExtension: false,
    isMobileWallet: true,
  },
  [SubstrateWalletSources.Math]: {
    id: SubstrateWalletSources.Math,
    name: 'Math Wallet',
    icon: '/partners/logo-mathwallet.png',
    source: SubstrateWalletSources.Math,
    url: 'https://mathwallet.org/en-us/',
    isBrowserExtension: false,
    isMobileWallet: true,
  },
  [SubstrateWalletSources.Enkrypt]: {
    id: SubstrateWalletSources.Enkrypt,
    name: 'Enkrypt',
    icon: '/partners/logo-enkrypt.png',
    source: SubstrateWalletSources.Enkrypt,
    url: 'https://www.enkrypt.com/#downloads',
    isBrowserExtension: true,
    isMobileWallet: false,
  },
  [SubstrateWalletSources.PolkaGate]: {
    id: SubstrateWalletSources.PolkaGate,
    name: 'PolkaGate',
    icon: '/partners/logo-polkagate.svg',
    source: SubstrateWalletSources.PolkaGate,
    url: 'https://chromewebstore.google.com/detail/polkagate-the-gateway-to/ginchbkmljhldofnbjabmeophlhdldgp?hl=en',
    isBrowserExtension: true,
    isMobileWallet: false,
  },
  [SubstrateWalletSources.Clover]: {
    id: SubstrateWalletSources.Clover,
    name: 'CLV Wallet',
    icon: '/partners/logo-clover.png',
    source: SubstrateWalletSources.Clover,
    url: 'https://chrome.google.com/webstore/detail/clv-wallet/nhnkbkgjikgcigadomkphalanndcapjk',
    isBrowserExtension: true,
    isMobileWallet: false,
  },
  [SubstrateWalletSources.Ledger]: {
    id: SubstrateWalletSources.Ledger,
    name: 'Ledger',
    icon: '/partners/logo-ledger.svg',
    source: SubstrateWalletSources.Ledger,
    url: 'https://www.ledger.com/ledger-live',
    isBrowserExtension: false,
    isMobileWallet: false,
  },
}

export const MobileWalletList = [
  SubstrateWalletSources.Nova,
  SubstrateWalletSources.SubWallet,
  SubstrateWalletSources.Math,
]

export const BrowserWalletList = [
  SubstrateWalletSources.Talisman,
  SubstrateWalletSources.SubWallet,
  SubstrateWalletSources.PolkadotJs,
  SubstrateWalletSources.PolkaGate,
  SubstrateWalletSources.Enkrypt,
  SubstrateWalletSources.Clover,
  SubstrateWalletSources.Ledger,
]

export function getAvailableWallets(): SubstrateWalletMetadata[] {
  const walletList = isMobileDevice ? MobileWalletList : BrowserWalletList
  return walletList
    .map(id => WalletRegistry[id])
    .filter((wallet): wallet is SubstrateWalletMetadata => wallet !== undefined)
}

export function getWalletSource(source: string): string {
  return SubstrateWalletSources[source as keyof typeof SubstrateWalletSources] || source
}
