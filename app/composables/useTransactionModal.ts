import type { Prefix } from '@kodadot1/static'
import type { TxEvent } from 'polkadot-api'

export interface CollectionCategory {
  type: 'collection'
  id: string
  name: string
  description: string
  image: string
  hash: string
  prefix: Prefix
}

export interface NftCategory {
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

const hash = ref('')
const error = ref<Error | null>(null)
const status = ref<'start' | TxEvent['type'] | null>(null)
const result = ref<TransactionResult | null>(null)
const open = ref(false)

export default function useTransactionModal() {
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

  watchEffect(() => {
    open.value = isLoading.value
  })

  return {
    // State
    hash,
    error,
    status,
    result,
    open,

    // Computed
    isLoading,
    isSuccess,
    isError,

    // Methods
    reset,
    close,
  }
}
