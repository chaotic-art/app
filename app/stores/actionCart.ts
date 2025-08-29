import type { NFTMetadata } from '~/services/oda'
import { useLocalStorage } from '@vueuse/core'

export type BaseActionCartItem = {
  sn: number
  name: string
  collection: {
    id: number
    name: string
  }
  price?: number
  currentOwner: string
  metadata: NFTMetadata
  metadata_uri: string
  mimeType?: string
} & CartItem

export const useActionCartStore = defineStore('actionCart', () => {
  const localStorage = useLocalStorage<BaseActionCartItem[]>('actionCart', [])

  const {
    items,
    chain,
    count,
    itemsInChain,
    allItemsInChain,
    getItem,
    existInItemIndex,
    isItemInCart,
    setItem,
    setItemDiscardedState,
    removeItem,
    clearDiscardedItems,
    clear: clearItems,
    updateItem,
  } = useCart<BaseActionCartItem>({ items: localStorage })

  const allOwnedItems = ref<BaseActionCartItem[]>([])

  function setOwnedItem(payload: BaseActionCartItem) {
    const itemIndex = existInItemIndex(payload.id, allOwnedItems.value)
    if (itemIndex === -1) {
      allOwnedItems.value.push(payload)
    }
  }

  function setOwnedItems(payload: BaseActionCartItem[]) {
    allOwnedItems.value = payload
  }

  function addAllToCart() {
    allOwnedItems.value.forEach(item => setItem(item))
  }

  function clear() {
    clearItems()
    allOwnedItems.value = []
  }

  function clearCartItems() {
    clearItems()
  }

  return {
    items,
    allOwnedItems,
    chain,
    allItemsInChain,
    itemsInChain,
    count,
    getItem,
    existInItemIndex,
    isItemInCart,
    setItem,
    setOwnedItem,
    setOwnedItems,
    addAllToCart,
    removeItem,
    setItemDiscardedState,
    clearDiscardedItems,
    clearCartItems,
    clear,
    updateItem,
  }
})
