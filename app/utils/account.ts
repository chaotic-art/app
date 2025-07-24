import type { Prefix } from '@kodadot1/static'
import type { KeyringAccount } from '~/types'
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto'

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

function accountToAddress(account: KeyringAccount | string) {
  return typeof account === 'string' ? account : account.address
}

export function pubKeyToAddress(publicKey: string) {
  const ss58Format = ss58Of(usePrefix().prefix.value)
  return encodeAddress(publicKey, <any>ss58Format)
}

export function toDefaultAddress(account: KeyringAccount | string) {
  const address = accountToAddress(account)

  if (address.startsWith('5')) {
    return address
  }

  const ss58Format = ss58Of(usePrefix().prefix.value)

  return encodeAddress(decodeAddress(address, <any>ss58Format))
}
