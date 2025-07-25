import type { TxInBestBlocksFound } from 'polkadot-api'
import type {
  ActionMintDrop,
  Actions,
  ExecuteSubstrateTransactionParams,
  ExecuteTransactionParams,
} from './transaction/types'
import type {
  HowAboutToExecuteOnResultParam,
  HowAboutToExecute as SubstrateHowAboutToExecute,
} from './useMetaTransaction'
import type { SubApi } from '@/plugins/api.client'
import {
  successMessage as successNotification,
  warningMessage,
} from '@/utils/notification'

import { hasOperationsDisabled } from '@/utils/prefix'
import { execMintDrop } from './transaction/transactionMintDrop'
import { NFTs } from './transaction/types'
import { isActionValid } from './transaction/utils'

export interface TransactionOptions {
  disableSuccessNotification?: boolean
}

function resolveMessage(message?: string | (() => string)) {
  if (!message) {
    return
  }
  if (typeof message === 'function') {
    return message()
  }
  return message
}

export function resolveSuccessMessage(block: number, successMessage?: string | ((blockNumber) => string)): string {
  if (typeof successMessage === 'function') {
    return successMessage(block)
  }
  return successMessage || 'Success!'
}

function useExecuteTransaction(options: TransactionOptions) {
  const { accountId } = useAuth()
  const error = ref(false)

  const {
    howAboutToExecute,
    isLoading,
    status,
    initTransactionLoader,
    isError,
  } = execByVm({
    SUB: () => useMetaTransaction(),
    // EVM: () => useEvmMetaTransaction() as unknown,
  }) as
  | ReturnType<typeof useMetaTransaction>
  // | ReturnType<typeof useEvmMetaTransaction>

  const blockNumber = ref<number>()
  const txHash = ref<string>()

  const executeTransaction = ({
    arg,
    successMessage,
    errorMessage,
    ...params
  }: ExecuteTransactionParams) => {
    const successCb = ({
      blockNumber: block,
    }: HowAboutToExecuteOnSuccessParam) => {
      if (options.disableSuccessNotification) {
        return
      }

      const message = resolveSuccessMessage(block, successMessage)

      successNotification(message)
    }

    const errorCb = () => {
      if (!errorMessage) {
        return
      }

      const message = resolveMessage(errorMessage)
      warningMessage(message)
    }

    const resultCb = (param: HowAboutToExecuteOnResultParam) => {
      txHash.value = param.event.txHash.toString()

      if (param.event.type === 'txBestBlocksState') {
        blockNumber.value = (param.event as TxInBestBlocksFound).block.number
      }
    }

    // TODO: add doAfterCheckCurrentChainVM
    initTransactionLoader()

    execByVm({
      SUB: () => {
        ;(howAboutToExecute as SubstrateHowAboutToExecute)(
          accountId.value,
          (params as ExecuteSubstrateTransactionParams).cb,
          arg,
          {
            onSuccess: successCb,
            onError: errorCb,
            onResult: resultCb,
          },
        )
      },
      // EVM: () => {
      //   const evmParams = params as ExecuteEvmTransactionParams
      //   ;(howAboutToExecute as EvmHowAboutToExecute)({
      //     account: accountId.value as Address,
      //     address: evmParams.address,
      //     abi: evmParams.abi,
      //     args: arg,
      //     functionName: evmParams.functionName,
      //     value: evmParams.value,
      //     onSuccess: successCb,
      //     onError: errorCb,
      //   } as EvmHowAboutToExecuteParam)
      // },
    })
  }

  const clear = () => {
    status.value = TransactionStatus.Unknown
    isError.value = false
    blockNumber.value = undefined
    txHash.value = undefined
    isLoading.value = false
  }

  return {
    isLoading,
    status,
    error,
    executeTransaction,
    blockNumber,
    txHash,
    isError,
    clear,
  }
}

export function executeAction({
  item,
  api,
  executeTransaction,
  isLoading,
  status,
}: {
  item: Actions
  api?: SubApi
  isLoading: Ref<boolean>
  status: Ref<string>
  executeTransaction: any
}) {
  const map = {
    [NFTs.MINT_DROP]: () =>
      execMintDrop({
        item: item as ActionMintDrop,
        api,
        executeTransaction,
        isLoading,
        status,
      }),
  }

  if (!isActionValid(item)) {
    console.warn(`Invalid action: ${JSON.stringify(item)}`)
    throw createError({
      statusCode: 404,
      statusMessage: `Invalid ${item.interaction} action`,
    })
  }

  return map[item.interaction]?.() ?? 'UNKNOWN'
}

export function useTransaction(options: TransactionOptions = { disableSuccessNotification: false }) {
  const { $api } = useNuxtApp()
  const { $i18n } = useNuxtApp()
  const { prefix: urlPrefix } = usePrefix()
  const {
    isLoading,
    status,
    executeTransaction,
    blockNumber,
    txHash,
    isError,
    clear,
  } = useExecuteTransaction(options)

  const transaction = async (item: Actions, prefix = undefined) => {
    if (hasOperationsDisabled(prefix || urlPrefix.value)) {
      warningMessage($i18n.t('toast.unsupportedOperation'))
      return
    }

    const api = execByVm({
      SUB: () => $api(prefix || urlPrefix.value),
    })

    return executeAction({ item, executeTransaction, api, isLoading, status })
  }

  return {
    isLoading,
    status,
    transaction,
    blockNumber,
    txHash,
    isError,
    clear,
  }
}
