import type { InjectedWindow, InjectedWindowProvider } from '@polkadot/extension-inject/types'
import type { SubstrateWalletSource } from './types'

export function getInjectedExtension(source: SubstrateWalletSource): InjectedWindowProvider | undefined {
  const injectedWindow = window as Window & InjectedWindow
  return injectedWindow?.injectedWeb3?.[source]
}

export function isExtensionInstalled(source: SubstrateWalletSource): boolean {
  return Boolean(getInjectedExtension(source))
}
