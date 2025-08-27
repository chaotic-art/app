import type { BaseActionCartItem } from '@/stores/actionCart'
import { defineStore } from 'pinia'

export const useAirdropStore = defineStore('airdrop', () => {
  const items = ref<BaseActionCartItem[]>([])
  const itemsInChain = computed(() => items.value)

  const count = computed(() => items.value.length)

  function setItem(item: BaseActionCartItem) {
    const existingIndex = items.value.findIndex(
      existing => existing.id === item.id && existing.collection.id === item.collection.id,
    )

    if (existingIndex === -1) {
      items.value.push(item)
    }
  }

  function removeItem(itemId: string, collectionId: number) {
    const index = items.value.findIndex(
      item => item.id === itemId && item.collection.id === collectionId,
    )

    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  function clear() {
    items.value = []
  }

  return {
    items,
    itemsInChain,
    count,
    setItem,
    removeItem,
    clear,
  }
})
