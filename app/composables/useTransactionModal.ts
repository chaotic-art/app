import type { Prefix } from '@kodadot1/static'
import type { TxEvent } from 'polkadot-api'
import type { NFTMetadata } from '~/services/oda'

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

export interface ListingTransactionResult {
  type: 'listing'
  items: {
    id: string
    sn: number
    price: number
    metadata: NFTMetadata
    metadata_uri: string
    collection: {
      id: number
      name: string
    }
  }[]
  hash: string
  prefix: Prefix
}

type TransactionResult = CollectionCategory | NftCategory | ListingTransactionResult

// Transaction status progression:
// 1. status.value = 'signed'
// 2. status.value = 'broadcasted'
// 3. status.value = 'txBestBlocksState'
// 4. status.value = 'finalized'
const status = ref<TxEvent['type'] | null>(null)
const hash = ref('')
const error = ref<Error | null>(null)
const result = ref<TransactionResult | null>(null)
const open = ref(false)

export default function useTransactionModal() {
  const isSuccess = computed(() => status.value === 'finalized' && !error.value)
  const isError = computed(() => Boolean(error.value))

  function close() {
    open.value = false
    status.value = null
    hash.value = ''
    error.value = null
    result.value = null
  }

  return {
    // State
    hash,
    error,
    status,
    result,
    open,

    // Computed
    isSuccess,
    isError,

    // Methods
    close,
  }
}
