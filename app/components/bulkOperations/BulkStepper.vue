<script setup lang="ts">
import type { StepConfig } from '~/types/bulkOperations'

const props = defineProps<{
  steps: StepConfig[]
  currentStep: number
  completedSteps: number[]
  maxStepReached?: number
}>()

const emit = defineEmits<{
  stepClick: [step: number]
}>()

function isCompleted(index: number) {
  return props.completedSteps.includes(index)
}

function isCurrent(index: number) {
  return props.currentStep === index
}

function isReachable(index: number) {
  return !isCurrent(index) && !isCompleted(index) && props.maxStepReached !== undefined && index <= props.maxStepReached
}

function isClickable(index: number) {
  return isCompleted(index) || isReachable(index)
}

function handleClick(index: number) {
  if (isClickable(index)) {
    emit('stepClick', index)
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <template v-for="(step, index) in steps" :key="index">
      <button
        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
        :class="{
          'bg-primary text-white': isCurrent(index),
          'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20': isCompleted(index) && !isCurrent(index),
          'bg-muted text-foreground cursor-pointer hover:bg-muted/80': isReachable(index),
          'bg-muted text-muted-foreground': !isCurrent(index) && !isCompleted(index) && !isReachable(index),
          'cursor-default': !isClickable(index) && !isCurrent(index),
        }"
        :disabled="!isClickable(index) && !isCurrent(index)"
        @click="handleClick(index)"
      >
        <UIcon
          v-if="isCompleted(index) && !isCurrent(index)"
          name="i-heroicons-check-20-solid"
          class="w-4 h-4"
        />
        <UIcon
          v-else-if="step.icon"
          :name="step.icon"
          class="w-4 h-4"
        />
        <span v-else class="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs" :class="isCurrent(index) ? 'border-white' : 'border-current'">
          {{ index + 1 }}
        </span>
        <span class="hidden sm:inline">{{ step.label }}</span>
      </button>

      <div
        v-if="index < steps.length - 1"
        class="h-px flex-1 max-w-8 transition-colors duration-200"
        :class="isCompleted(index) ? 'bg-primary' : 'bg-border'"
      />
    </template>
  </div>
</template>
