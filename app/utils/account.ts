import type { Prefix } from '@kodadot1/static'
import { encodeAddress } from '@polkadot/util-crypto'

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

export function shortenAddress(address: string, length = 4) {
  return `${address.slice(0, length)}...${address.slice(-length)}`
}
