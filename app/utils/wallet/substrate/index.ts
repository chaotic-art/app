import type { SubstrateWalletSource } from './types'
import { decodeAddress, keccakAsHex } from 'dedot/utils'

export function getInjectedExtension(source: SubstrateWalletSource) {
  const injectedWindow = window
  return injectedWindow?.injectedWeb3?.[source]
}

export function isExtensionInstalled(source: SubstrateWalletSource): boolean {
  return Boolean(getInjectedExtension(source))
}

export function derieveEthAddress(address: string): `0x${string}` {
  const hash = keccakAsHex(decodeAddress(address))
  return `0x${hash.slice(-40)}` as `0x${string}`
}
