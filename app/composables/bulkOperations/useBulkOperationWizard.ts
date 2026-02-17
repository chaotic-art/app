import type { StepConfig } from '~/types/bulkOperations'

interface WizardOptions {
  steps: StepConfig[]
  onComplete?: () => void
}

export function useBulkOperationWizard(options: WizardOptions) {
  const store = useBulkOperationsStore()

  const completedSteps = computed(() => {
    const completed: number[] = []
    for (let i = 0; i < store.currentStep; i++) {
      completed.push(i)
    }
    return completed
  })

  const isFirstStep = computed(() => store.currentStep === 0)
  const isLastStep = computed(() => store.currentStep === options.steps.length - 1)

  function handleNext() {
    if (isLastStep.value && options.onComplete) {
      options.onComplete()
    }
    else {
      store.nextStep()
    }
  }

  function handleBack() {
    store.prevStep()
  }

  function handleKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    const isEditableTarget = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable

    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      if (isEditableTarget)
        return
      event.preventDefault()
      if (store.canProceed) {
        handleNext()
      }
    }
    if (event.key === 'Escape') {
      if (isEditableTarget)
        return
      event.preventDefault()
      handleBack()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    store,
    completedSteps,
    isFirstStep,
    isLastStep,
    handleNext,
    handleBack,
  }
}
