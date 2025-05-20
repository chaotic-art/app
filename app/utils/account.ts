import type { ChainAccount } from '@/types'
import { encodeAddress } from '@polkadot/util-crypto'

export function formatAddress(account: ChainAccount) {
  if (account.vm === 'SUB') {
    return encodeAddress(account.address, account.ss58)
  }
  return ''
}
