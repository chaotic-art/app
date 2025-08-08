import type { TxEvent } from 'polkadot-api'

export enum TransactionStatus {
  Unknown = '',
  Sign = 'loader.sign',
  Casting = 'loader.casting',
  Broadcast = 'loader.broadcast',
  Block = 'loader.block',
  Finalized = 'loader.finalized',
  IPFS = 'loader.ipfs',
  Cancelled = 'loader.cancelled',
}

export default function useTransactionStatus() {
  const status = ref<TransactionStatus>(TransactionStatus.Unknown)
  const isLoading = ref(false)

  const resolveStatus = (
    event: TxEvent,
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
      status.value = TransactionStatus.Finalized
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
