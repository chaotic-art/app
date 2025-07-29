import type { TxEvent } from 'polkadot-api'

export enum TransactionStatus {
  Broadcast = 'loader.broadcast',
  Casting = 'loader.casting',
  Sign = 'loader.sign',
  Block = 'loader.block',
  Finalized = 'loader.finalized',
  Unknown = '',
  IPFS = 'loader.ipfs',
  Cancelled = 'loader.cancelled',
}

function useTransactionStatus() {
  const status = ref<TransactionStatus>(TransactionStatus.Unknown)
  const isLoading = ref(false)

  const resolveStatus = (
    event: TxEvent,
    omitFinalized?: boolean,
  ): void => {
    if (event.type === 'broadcasted') {
      status.value = TransactionStatus.Broadcast
      return
    }

    if (event.type === 'signed') {
      status.value = TransactionStatus.Casting
      return
    }

    if (event.type === 'txBestBlocksState') {
      status.value = TransactionStatus.Block
      return
    }

    if (event.type === 'finalized') {
      status.value = omitFinalized
        ? TransactionStatus.Unknown
        : TransactionStatus.Finalized
      return
    }

    status.value = TransactionStatus.Unknown
  }

  const initTransactionLoader = (): void => {
    isLoading.value = true
    status.value = TransactionStatus.Unknown
  }

  const stopLoader = (): void => {
    isLoading.value = false
    status.value = TransactionStatus.Unknown
  }

  return {
    status,
    isLoading,
    resolveStatus,
    initTransactionLoader,
    stopLoader,
  }
}

export default useTransactionStatus
