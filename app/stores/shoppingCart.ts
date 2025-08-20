import { useLocalStorage } from '@vueuse/core'

export type ShoppingCartItem = {} & BaseActionCartItem

export const useShoppingCartStore = defineStore('shoppingCart', () => {
  const localStorage = useLocalStorage<ShoppingCartItem[]>('shoppingCart', [])

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
  } = useCart<ShoppingCartItem>({ items: localStorage })

  const itemToBuy = ref<ShoppingCartItem>()

  function clearCartItems() {
    clearItems()
  }

  function clear() {
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

    // Shopping-specific additions
    clear,
    itemToBuy,
  }
})
