<script setup lang="ts">
import type { AssetMessage } from '../types'

defineProps<{
  assets: Array<AssetMessage>
  indexContent: string
}>()

defineEmits(['upload'])

const testPerformance = ref(false)
const testCapture = ref(false)
</script>

<template>
  <div class="w-full">
    <h3 class="text-lg font-semibold mb-4">
      {{ $t('codeChecker.captureService') }}
    </h3>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span>{{ $t('codeChecker.testOutPerformance') }}</span>
        <UToggle v-model="testPerformance" />
      </div>
      <div class="flex items-center justify-between">
        <span>{{ $t('codeChecker.testOutCaptureService') }}</span>
        <UToggle v-model="testCapture" />
      </div>
    </div>
  </div>
</template>
