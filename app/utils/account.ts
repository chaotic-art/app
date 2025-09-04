import type { Prefix } from '@kodadot1/static'
import type { SupportedChain } from '~/plugins/sdk.client'
import { decodeAddress, encodeAddress, isEvmAddress } from 'dedot/utils'

export function formatAddress({
  address,
  prefix,
}: {
  address: string
  prefix: Prefix | SupportedChain
}) {
  return encodeAddress(address, chainSpec[prefix as SupportedChain].ss58Format)
}

export function isValidSubstrateAddress(address: string): boolean {
  try {
    encodeAddress(decodeAddress(address))
    return true
  }
  catch {
    return false
  }
}

export function getss58AddressByPrefix(address: string, prefix: Prefix) {
  try {
    if (isEvmAddress(address)) {
      return address
    }
    const ss58Format = chainSpec[prefix as SupportedChain].ss58Format
    const decodedAddress = decodeAddress(address)
    return encodeAddress(decodedAddress, ss58Format)
  }
  catch {
    return ''
  }
}

function isSameAddressSubstrate(address1: string, address2: string): boolean {
  try {
    return encodeAddress(decodeAddress(address1)) === encodeAddress(decodeAddress(address2))
  }
  catch {
    return false
  }
}

function isSameAddressEvm(address1: string, address2: string): boolean {
  return address1.toLowerCase() === address2.toLowerCase()
}

export function isSameAccount(account1: string, account2: string): boolean {
  const address1 = account1
  const address2 = account2

  return isEvmAddress(address1)
    ? isSameAddressEvm(address1, address2)
    : isSameAddressSubstrate(address1, address2)
}

export function accountsAreSame(account1?: string, account2?: string): boolean {
  return Boolean(account1 && account2 && isSameAccount(account1, account2))
}
