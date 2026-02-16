import type { AssetHubChain } from '~/plugins/sdk.client'
import type { BulkOperationItem } from '~/types/bulkOperations'
import { defineStore } from 'pinia'
import { BulkOperationType, MassMintStep } from '~/types/bulkOperations'

export const useBulkOperationsStore = defineStore('bulkOperations', () => {
  const operationType = ref<BulkOperationType>(BulkOperationType.MASS_MINT)
  const currentStep = ref(0)
  const maxStepReached = ref(0)
  const collectionId = ref('')
  const chain = ref<AssetHubChain>('ahp')
  const isActive = ref(false)

  const {
    items,
    count,
    itemsInChain,
    getItem,
    setItem,
    removeItem,
    clear: clearItems,
    updateItem,
  } = useCart<BulkOperationItem & { chain: AssetHubChain }>({
    chain: computed(() => chain.value),
  })

  const totalSteps = computed(() => {
    if (operationType.value === BulkOperationType.MASS_MINT) {
      return 4
    }
    return 3
  })

  const canProceed = computed(() => {
    if (operationType.value === BulkOperationType.MASS_MINT) {
      switch (currentStep.value) {
        case MassMintStep.UPLOAD:
          return count.value > 0
        case MassMintStep.METADATA:
          return true
        case MassMintStep.REVIEW:
          return true
        case MassMintStep.MINT:
          return false
        default:
          return false
      }
    }
    return true
  })

  const progressPercentage = computed(() => {
    return Math.round((currentStep.value / (totalSteps.value - 1)) * 100)
  })

  function initOperation(type: BulkOperationType, colId: string, ch: AssetHubChain) {
    operationType.value = type
    collectionId.value = colId
    chain.value = ch
    currentStep.value = 0
    maxStepReached.value = 0
    isActive.value = true
  }

  function nextStep() {
    if (currentStep.value < totalSteps.value - 1) {
      currentStep.value++
      if (currentStep.value > maxStepReached.value) {
        maxStepReached.value = currentStep.value
      }
    }
  }

  function prevStep() {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  function goToStep(step: number) {
    if (step >= 0 && step < totalSteps.value && step <= maxStepReached.value) {
      currentStep.value = step
    }
  }

  function reset() {
    operationType.value = BulkOperationType.MASS_MINT
    currentStep.value = 0
    collectionId.value = ''
    isActive.value = false
    clearItems()
  }

  return {
    operationType,
    currentStep,
    maxStepReached,
    collectionId,
    chain,
    isActive,
    items,
    count,
    itemsInChain,
    totalSteps,
    canProceed,
    progressPercentage,
    getItem,
    setItem,
    removeItem,
    updateItem,
    initOperation,
    nextStep,
    prevStep,
    goToStep,
    reset,
  }
}, { persist: true })
