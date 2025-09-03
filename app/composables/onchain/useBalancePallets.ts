import type { TxType } from './useNftPallets'
import type { AssetHubChain } from '~/plugins/sdk.client'

import { MultiAddress } from '~/descriptors/dist'
import { useNftPallets } from './useNftPallets'

interface TransferBalanceParams {
  chain: AssetHubChain
  type?: TxType
  targets: { address: string, amount: number }[]
}

export function useBalancesPallets() {
  const { $sdk } = useNuxtApp()
  const { getConnectedSubAccount } = storeToRefs(useWalletStore())
  const { getAccountSigner } = useNftPallets()
  const { hash, error, status, result, open } = useTransactionModal()

  async function transfer({
    chain,
    targets,
    type = 'submit',
  }: TransferBalanceParams) {
    const api = $sdk(chain).api
    const { address, signer } = await getAccountSigner()

    const txs = targets.map(({ address, amount }) => {
      return api.tx.Balances.transfer_keep_alive({
        dest: MultiAddress.Id(address),
        value: BigInt(Number(amount)),
      })
    })

    const transaction = api.tx.Utility.batch_all({
      calls: txs.map(tx => tx!.decodedCall),
    })

    if (type === 'estimate') {
      return transaction.getEstimatedFees(address)
    }

    if (!getConnectedSubAccount.value?.address) {
      throw new Error('No address found')
    }

    open.value = true

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found && event.ok) {
          hash.value = event.txHash.toString()

          result.value = {
            type: 'transfer',
            hash: hash.value,
            prefix: chain,
          }
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  return {
    transfer,
  }
}
