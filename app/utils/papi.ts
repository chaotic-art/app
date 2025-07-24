import type { SubApi } from '@/plugins/api.client'
import { MultiAddress } from '@/descriptors'

function toMultiAddress(id: string): MultiAddress {
  return MultiAddress.Id(id)
}

export function asBalanceTransfer(api: SubApi, to: string, amount: string | bigint | number) {
  return api.tx.Balances.transfer_allow_death({
    dest: toMultiAddress(to),
    value: BigInt(amount),
  })
}
