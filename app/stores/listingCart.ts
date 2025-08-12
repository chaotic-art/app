import { useLocalStorage } from '@vueuse/core'

export const DEFAULT_FLOOR_PRICE_RATE = 1.0

export type ListingCartItem = {
  listPrice?: number
  collection: {
    floor?: number
  }
} & BaseActionCartItem

export const useListingCartStore = defineStore('listingCart', () => {
  const localStorage = useLocalStorage<ListingCartItem[]>('listingCart', [])

  const {
    items,
    chain,
    count,
    decimals,
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
  } = useCart<ListingCartItem>({ items: localStorage })

  const incompleteListPrices = computed(() =>
    itemsInChain.value.filter(item => !item.listPrice).length,
  )

  function clearCartItems() {
    clearItems()
  }

  function setItemPrice({ id, price }: { id: string, price?: number }) {
    const itemIndex = existInItemIndex(id, items.value)
    if (itemIndex !== -1) {
      items.value[itemIndex]!.listPrice = price
    }
  }

  function setFixedPrice(price: number) {
    itemsInChain.value.forEach((item) => {
      item.listPrice = price
    })
  }

  function setFloorPrice(rate = DEFAULT_FLOOR_PRICE_RATE) {
    itemsInChain.value.forEach((item) => {
      const floor = (Number(item.collection.floor) || 0) * +rate.toFixed(2)
      item.listPrice = Number((floor / (10 ** decimals.value)).toFixed(4))
    })
  }

  function clearListedItems() {
    clearCartItems()
  }

  return {
    items,
    chain,
    allItemsInChain,
    itemsInChain,
    count,

    getItem,
    existInItemIndex,
    isItemInCart,
    setItem,
    removeItem,
    setItemDiscardedState,
    clearDiscardedItems,
    clearCartItems,
    updateItem,

    // Listing-specific additions
    incompleteListPrices,
    setItemPrice,
    setFixedPrice,
    setFloorPrice,
    clearListedItems,
  }
})
