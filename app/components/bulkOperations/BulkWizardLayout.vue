<script setup lang="ts">
import type { StepConfig } from '~/types/bulkOperations'

const props = withDefaults(defineProps<{
  title: string
  steps: StepConfig[]
  currentStep: number
  completedSteps: number[]
  maxStepReached?: number
  canProceed?: boolean
  continueLabel?: string
  loading?: boolean
  backLink?: string
  showFooter?: boolean
  compact?: boolean
}>(), {
  canProceed: false,
  continueLabel: 'Continue',
  showFooter: true,
})

const emit = defineEmits<{
  back: []
  continue: []
  stepClick: [step: number]
}>()

const router = useRouter()

function handleBackLink() {
  if (props.backLink) {
    router.push(props.backLink)
  }
  else {
    router.back()
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center gap-4 px-6 py-4 border-b border-border bg-background shrink-0">
      <template v-if="!compact">
        <UButton
          variant="ghost"
          icon="i-heroicons-arrow-left"
          size="sm"
          @click="handleBackLink"
        />

        <h1 class="text-lg font-semibold shrink-0">
          {{ title }}
        </h1>
      </template>

      <BulkStepper
        :steps="steps"
        :current-step="currentStep"
        :completed-steps="completedSteps"
        :max-step-reached="maxStepReached"
        class="flex-1 justify-center"
        @step-click="emit('stepClick', $event)"
      />
    </div>

    <div class="flex-1 overflow-y-auto">
      <slot />
    </div>

    <BulkWizardFooter
      v-if="showFooter"
      :back-disabled="currentStep === 0"
      :continue-disabled="!canProceed"
      :continue-label="continueLabel"
      :loading="loading"
      :show-back="currentStep > 0"
      @back="emit('back')"
      @continue="emit('continue')"
    >
      <template #cost-estimate>
        <slot name="cost-estimate" />
      </template>
    </BulkWizardFooter>
  </div>
</template>
