import type { TxEvent } from 'polkadot-api'

import type {
  TxObserverOnErrorCallback,
  TxObserverOnResultCallback,
  TxObserverOnSuccessCallback,
} from '@/utils/transactionExecutor'
import exec, {
  txObserver,
} from '@/utils/transactionExecutor'
import useTransactionStatus from './useTransactionStatus'

export interface HowAboutToExecuteOnSuccessParam {
  txHash: string
  blockNumber: number
}

export interface HowAboutToExecuteOnResultParam {
  txHash: string
  event: TxEvent
}

interface HowAboutToExecuteOptions {
  onSuccess?: (param: HowAboutToExecuteOnSuccessParam) => void
  onError?: () => void
  onResult?: (result: HowAboutToExecuteOnResultParam) => void
}

export type HowAboutToExecute = (
  account: string,
  cb: (...params: any[]) => any,
  args: any[],
  options?: HowAboutToExecuteOptions
) => Promise<void>

function useMetaTransaction() {
  // const { $i18n } = useNuxtApp()
  const {
    isLoading,
    resolveStatus,
    initTransactionLoader,
    status,
    stopLoader,
  } = useTransactionStatus()
  // const { api } = usePapi()
  // const tx = ref<ExecResult>()

  /**
   *  Indicates whether an error occurred during the transaction.
   *  This can be true if:
   *  - {@link TransactionStatus.Unknown} Invalid Transaction (e.g., inability to pay some fees)
   *  - {@link TransactionStatus.Block}
   */
  const isError = ref(false)

  const successCb
    = (onSuccess?: (param: HowAboutToExecuteOnSuccessParam) => void): TxObserverOnSuccessCallback =>
      async ({ blockNumber, txHash }) => {
        if (onSuccess) {
          onSuccess({ txHash, blockNumber })
        }

        isLoading.value = false
        // tx.value = undefined
      }

  const resultCb
    = (onResult?: (result: HowAboutToExecuteOnResultParam) => void): TxObserverOnResultCallback =>
      (event) => {
        resolveStatus(event)
        onResult?.({ txHash: event.txHash.toString(), event })
      }

  const onCatchError = (error: Error | string) => {
    if (error instanceof Error) {
      const errorMessage = error.message?.toLowerCase() || ''
      const isCancelled = errorMessage.includes('cancelled') || errorMessage.includes('rejected')

      if (isCancelled) {
        // warningMessage($i18n.t('general.tx.cancelled'), { reportable: false })
        status.value = TransactionStatus.Cancelled
      }
      else {
        isError.value = true
        // warningMessage(e.toString())
      }
      isLoading.value = false
      // tx.value = undefined
    }
  }

  const errorCb = (onError: () => void): TxObserverOnErrorCallback =>
    (error) => {
      onCatchError(error)

      if (onError) {
        onError()
      }
    }

  const howAboutToExecute: HowAboutToExecute = async (
    account,
    cb,
    args,
    {
      onSuccess,
      onError,
      onResult,
    } = {},
  ): Promise<void> => {
    try {
      await exec(
        account,
        cb,
        args,
        txObserver(
          successCb(onSuccess),
          errorCb(onError),
          resultCb(onResult),
        ),
      )
    }
    catch (e) {
      onCatchError(e)
    }
  }

  return {
    howAboutToExecute,
    initTransactionLoader,
    status,
    isLoading,
    stopLoader,
    isError,
  }
}

export default useMetaTransaction
