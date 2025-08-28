import type { AssetHubChain } from '~/plugins/sdk.client'

export interface CartItem {
  id: string
  chain: AssetHubChain
  discarded?: boolean
}

export function useCart<T extends CartItem>({
  items = ref([]),
}: {
  items?: Ref<T[]>
} = {}) {
  const chain = useChain().currentChain
  const decimals = useChain().decimals
  const allItemsInChain = computed(() => items.value.filter(item => item.chain === chain.value))
  const itemsInChain = computed(() => allItemsInChain.value.filter(item => !item.discarded))
  const count = computed(() => itemsInChain.value.length)

  function getItem(id: string) {
    return items.value.find(item => item.id === id)
  }

  function existInItemIndex<T extends CartItem>(id: string, items: T[]) {
    return items.findIndex(item => item.id === id)
  }

  function isItemInCart(id: string) {
    return existInItemIndex(id, items.value) !== -1
  }

  function clearDiscardedItems() {
    items.value = items.value.filter(item => !item.discarded)
  }

  function setItem(payload: T) {
    const itemIndex = existInItemIndex(payload.id, items.value)
    if (itemIndex === -1) {
      items.value.push(payload as any)
    }
  }

  function updateItem(payload: Partial<T>) {
    const existingItemIndex = items.value.findIndex(item => item.id === payload.id)
    if (existingItemIndex !== -1 && items.value[existingItemIndex]) {
      items.value[existingItemIndex] = {
        ...items.value[existingItemIndex],
        ...payload,
      }
    }
  }

  function setItemDiscardedState({ id, discarded }: { id: string, discarded: boolean }) {
    const itemIndex = existInItemIndex(id, items.value)
    if (itemIndex !== -1) {
      items.value[itemIndex]!.discarded = discarded
    }
  }

  function removeItem(id: string) {
    const itemIndex = existInItemIndex(id, items.value)
    if (itemIndex !== -1) {
      items.value.splice(itemIndex, 1)
    }
  }

  function clear() {
    items.value = []
  }

  return {
    items,
    chain,
    decimals,
    count,
    allItemsInChain,
    itemsInChain,
    getItem,
    isItemInCart,
    clearDiscardedItems,
    clear,
    existInItemIndex,
    removeItem,
    updateItem,
    setItem,
    setItemDiscardedState,
  }
}
