<script lang="ts" setup>
import type { CanvasPreviewItem, CapturePreviewItem } from '../types'
import { useVModel } from '@vueuse/core'
import { mean } from '@/utils/math'

const props = defineProps<{
  modelValue: number
  previews: CapturePreviewItem[] | CanvasPreviewItem[]
  hideAverage?: boolean
}>()
defineEmits(['retry'])
const amount = useVModel(props, 'modelValue')

const average = computed(() => {
  const previews = props.previews
    .filter(preview => preview.renderedAt && preview.startedAt)
    .map(preview => preview.renderedAt! - preview.startedAt!)

  return previews.length ? `${(mean(previews) / 1000).toFixed(2)}s` : '-'
})
</script>

<template>
  <div class="flex flex-col">
    <div class="flex justify-between items-center">
      <p>
        {{ $t('codeChecker.numberOfInputs') }}
      </p>

      <div
        v-if="!hideAverage"
        class="text-gray-600 dark:text-gray-400 text-xs flex gap-3"
      >
        <p class="capitalize">
          {{ $t('codeChecker.timePerVariation') }}
        </p>
        <p>{{ average }}</p>
      </div>
    </div>

    <div class="flex gap-2 mt-4! w-full">
      <UInput
        v-model="amount"
        class="w-1/4"
        type="number"
        min="1"
      />
      <UButton
        class="w-3/4"
        @click="$emit('retry')"
      >
        <div class="inline-flex items-center gap-2">
          <span class="capitalize">
            {{ $t('codeChecker.retryTest') }}
          </span>
          <UIcon name="i-mdi:rotate-left" />
        </div>
      </UButton>
    </div>
  </div>
</template>
