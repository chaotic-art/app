import type { SwapSurcharge } from '~/composables/onchain/useNftPallets'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { SwapStep } from '@/components/swap/types'

// const ITEMS_MAX_AGE_MS = 7 * ONE_DAY_MS
// const ITEMS_MAX_AMOUNT_PER_CHAIN = 5

export type CrateSwapWithFields = Partial<Omit<AtomicSwap, 'id'>>

export type AtomicSwap = {
  counterparty: string
  creator?: string
  offered: SwapItem[]
  desired: SwapItem[]
  createdAt: number
  surcharge?: SwapSurcharge
  duration: number
  blockNumber?: number
  isCollectionSwap?: boolean
} & CartItem

export interface SwapItem {
  id: string
  name: string
  collectionId: number
  sn: number | null
  meta: { image: string }
}

const DEFAULT_SWAP: Omit<AtomicSwap, 'chain'> = {
  id: '',
  counterparty: '',
  offered: [],
  desired: [],
  createdAt: 0,
  duration: 7,
}

export const useAtomicSwapStore = defineStore('atomicSwap', () => {
  const {
    items,
    count,
    itemsInChain,
    getItem,
    setItem,
    clear,
    updateItem,
  } = useCart<AtomicSwap>()

  const { accountId } = useAuth()

  const swap = ref<AtomicSwap>({ ...DEFAULT_SWAP, chain: undefined })
  const step = ref(SwapStep.COUNTERPARTY)

  const getStepItems = (step: SwapStep) => swap.value[getStepItemsKey(step) || ''] || []

  const getItems = computed(() => items.value)
  const stepItems = computed(() => getStepItems(step.value))

  const createSwap = (counterparty: string, chain: AssetHubChain, withFields?: CrateSwapWithFields) => {
    const newAtomicSwap: AtomicSwap = {
      id: Math.random().toString(16).slice(2, 10),
      counterparty,
      isCollectionSwap: false,
      offered: [],
      desired: [],
      createdAt: Date.now(),
      chain,
      duration: 7,
      creator: accountId.value ? accountId.value : undefined,
    }

    if (withFields) {
      Object.assign(newAtomicSwap, withFields)
    }

    setItem(newAtomicSwap)

    return newAtomicSwap
  }

  const updateSwap = (payload: Partial<AtomicSwap>) => {
    swap.value = {
      ...swap.value,
      ...payload,
    }
    updateItem(swap.value)
  }

  const updateStepItems = (items: SwapItem[]) => {
    const key = getStepItemsKey(step.value)
    if (key) {
      updateSwap({ [key]: items })
    }
  }

  const removeStepItem = (id: string) => {
    updateStepItems(getStepItems(step.value).filter(item => item.id !== id))
  }

  return {
    // state
    items,
    swap,
    step,
    // getters
    count,
    itemsInChain,
    getItems,
    stepItems,
    // actions
    getItem,
    getStepItems,
    clear,
    createSwap,
    updateSwap,
    updateItem,
    updateStepItems,
    removeStepItem,
  }
}, { persist: {
  // clear swaps on session start
  // afterHydrate: (context) => {
  //   const recentSwaps = (context.store.items as AtomicSwap[])
  //     .filter((swap: AtomicSwap) =>
  //       getSwapStep(swap) !== SwapStep.CREATED
  //       && swap.createdAt >= Date.now() - ITEMS_MAX_AGE_MS,
  //     )

  //   context.store.items = Object
  //     .values(groupBy(recentSwaps, 'chain'))
  //     .map(items => items.sort((a, b) => a.createdAt - b.createdAt).slice(0, ITEMS_MAX_AMOUNT_PER_CHAIN - 1))
  //     .flat()
  // },
} })
