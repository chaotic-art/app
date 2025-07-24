import type { Prefix } from '@kodadot1/static'
import { decodeAddress, encodeAddress } from 'dedot/utils'

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
