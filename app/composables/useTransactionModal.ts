import type { TxEvent } from 'polkadot-api'

export default function useTransactionModal() {
  const hash = useState('transaction-hash', () => '')
  const error = useState<Error | null>('transaction-error', () => null)
  const status = useState<TxEvent['type'] | null>('transaction-status', () => null)

  // Transaction status progression:
  // 1. status.value = 'signed'
  // 2. status.value = 'broadcasted'
  // 3. status.value = 'txBestBlocksState'
  // 4. status.value = 'finalized'

  const isLoading = computed(() => Boolean(status.value?.length && status.value !== 'finalized'))
  const isSuccess = computed(() => status.value === 'finalized' && !error.value)
  const isError = computed(() => Boolean(error.value))

  return {
    // State
    hash,
    error,
    status,

    // Computed
    isLoading,
    isSuccess,
    isError,
  }
}
