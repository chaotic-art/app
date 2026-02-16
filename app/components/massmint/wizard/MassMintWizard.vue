<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { StepConfig } from '~/types/bulkOperations'
import { useBulkOperationWizard } from '~/composables/bulkOperations/useBulkOperationWizard'
import { useMassMintWizard } from '~/composables/massmint/useMassMintWizard'
import { BulkOperationType, MassMintStep } from '~/types/bulkOperations'

const props = defineProps<{
  collectionId: string
  chain: AssetHubChain
  collectionName: string
  existingItemCount: number
  returnRoute?: string
  compact?: boolean
}>()

const route = useRoute()
const store = useBulkOperationsStore()
const wizard = useMassMintWizard()

const isMock = computed(() => route.query.mock === 'true')

const steps: StepConfig[] = [
  { label: 'Upload', icon: 'i-heroicons-arrow-up-tray' },
  { label: 'Metadata', icon: 'i-heroicons-document-text' },
  { label: 'Review', icon: 'i-heroicons-eye' },
  { label: 'Mint', icon: 'i-heroicons-sparkles' },
]

const { completedSteps, handleNext, handleBack } = useBulkOperationWizard({
  steps,
  onComplete: () => {},
})

onMounted(() => {
  store.initOperation(BulkOperationType.MASS_MINT, props.collectionId, props.chain)
})

onUnmounted(() => {
  if (store.currentStep !== MassMintStep.MINT) {
    store.reset()
  }
})

const canProceed = computed(() => {
  switch (store.currentStep) {
    case MassMintStep.UPLOAD:
      return wizard.canProceedFromUpload.value
    case MassMintStep.METADATA:
      return isMock.value || wizard.canProceedFromMetadata.value
    case MassMintStep.REVIEW:
      return true
    default:
      return false
  }
})

const continueLabel = computed(() => {
  if (store.currentStep === MassMintStep.REVIEW)
    return 'Proceed to Mint'
  if (store.currentStep === MassMintStep.MINT)
    return 'Mint Now'
  return 'Continue'
})

const showFooter = computed(() => store.currentStep !== MassMintStep.MINT)

function handleStepClick(step: number) {
  store.goToStep(step)
}

function handleContinue() {
  if (store.currentStep === MassMintStep.METADATA) {
    wizard.applySharedDescription()
  }
  handleNext()
}

const backLink = computed(() => props.returnRoute || `/${props.chain}/collection/${props.collectionId}?admin=true`)
</script>

<template>
  <BulkWizardLayout
    :title="`Mass Mint — ${collectionName}`"
    :steps="steps"
    :current-step="store.currentStep"
    :completed-steps="completedSteps"
    :max-step-reached="store.maxStepReached"
    :can-proceed="canProceed"
    :continue-label="continueLabel"
    :show-footer="showFooter"
    :back-link="backLink"
    :compact="compact"
    @back="handleBack"
    @continue="handleContinue"
    @step-click="handleStepClick"
  >
    <UploadStep
      v-if="store.currentStep === MassMintStep.UPLOAD"
      :wizard="wizard"
    />

    <MetadataStep
      v-else-if="store.currentStep === MassMintStep.METADATA"
      :wizard="wizard"
      :existing-item-count="existingItemCount"
    />

    <ReviewStep
      v-else-if="store.currentStep === MassMintStep.REVIEW"
      :wizard="wizard"
      :collection-id="collectionId"
      :chain="chain"
    />

    <MintStep
      v-else-if="store.currentStep === MassMintStep.MINT"
      :wizard="wizard"
      :collection-id="collectionId"
      :collection-name="collectionName"
      :chain="chain"
      :return-route="returnRoute"
    />
  </BulkWizardLayout>
</template>
