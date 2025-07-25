import type { ExecuteSubstrateTransactionParams } from '@/composables/transaction/types'
import type { SubApi } from '@/plugins/api.client'
import type { Transaction } from '@/utils/transactionExecutor'
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

export function asBatchAllTransaction(api: SubApi, transactions: Transaction[]): ExecuteSubstrateTransactionParams {
  const arg: Parameters<typeof api.tx.Utility.batch_all>[0] = {
    calls: transactions.map(transaction => transaction.decodedCall),
  }

  return {
    cb: api.tx.Utility.batch_all,
    arg: [arg],
  }
}
