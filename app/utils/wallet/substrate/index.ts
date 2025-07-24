import type { SubstrateWalletSource } from './types'

export function getInjectedExtension(source: SubstrateWalletSource) {
  const injectedWindow = window
  return injectedWindow?.injectedWeb3?.[source]
}

export function isExtensionInstalled(source: SubstrateWalletSource): boolean {
  return Boolean(getInjectedExtension(source))
}
