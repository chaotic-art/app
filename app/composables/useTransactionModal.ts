import type { Prefix } from '@kodadot1/static'
import type { TxEvent } from 'polkadot-api'

interface CollectionCategory {
  type: 'collection'
  id: string
  name: string
  description: string
  image: string
  hash: string
  prefix: Prefix
}

interface NftCategory {
  type: 'nft'
  collectionId: string
  itemIds: string[]
  name: string
  description: string
  image: string
  supply: number
  hash: string
  prefix: Prefix
}

type TransactionResult = CollectionCategory | NftCategory

export default function useTransactionModal() {
  const hash = useState('transaction-hash', () => '')
  const error = useState<Error | null>('transaction-error', () => null)
  const status = useState<'start' | TxEvent['type'] | null>('transaction-status', () => null)
  const result = useState<TransactionResult | null>('transaction-result', () => null)

  // Transaction status progression:
  // 1. status.value = 'signed'
  // 2. status.value = 'broadcasted'
  // 3. status.value = 'txBestBlocksState'
  // 4. status.value = 'finalized'

  const isLoading = computed(() => Boolean(status.value?.length))
  const isSuccess = computed(() => status.value === 'finalized' && !error.value)
  const isError = computed(() => Boolean(error.value))

  function reset() {
    hash.value = ''
    error.value = null
    result.value = null
  }

  function close() {
    status.value = null
    reset()
  }

  return {
    // State
    hash,
    error,
    status,
    result,

    // Computed
    isLoading,
    isSuccess,
    isError,

    // Methods
    reset,
    close,
  }
}
