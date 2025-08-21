import { useLocalStorage } from '@vueuse/core'

export type ShoppingCartItem = {
  collectionName: string
} & BaseActionCartItem

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
    removeItem,
    clear: clearItems,
    updateItem,
  } = useCart<ShoppingCartItem>({ items: localStorage })

  const itemToBuy = ref<ShoppingCartItem>()

  function clearCartItems() {
    clearItems()
  }

  function clear() {
    clearCartItems()
    itemToBuy.value = undefined
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
    clearCartItems,
    updateItem,

    // Shopping-specific additions
    clear,
    itemToBuy,
  }
})
