import type { Prefix } from '@kodadot1/static'
import { decodeAddress, encodeAddress, isEvmAddress } from 'dedot/utils'

export function formatAddress({
  address,
  prefix,
}: {
  address: string
  prefix: Prefix
}) {
  return execByVm({
    SUB: () => encodeAddress(address, ss58Of(prefix)),
  }, { prefix }) || ''
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
    const ss58Format = ss58Of(prefix)
    const decodedAddress = decodeAddress(address)
    return encodeAddress(decodedAddress, ss58Format)
  }
  catch {
    return ''
  }
}
