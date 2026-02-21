<script setup lang="ts">
import type { AnalyticsRange } from '~/types/collectionAnalytics'

defineProps<{
  allRangeCapped: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  export: []
}>()

const range = defineModel<AnalyticsRange>('range', {
  default: 'all',
})

const rangeOptions: Array<{ label: string, value: AnalyticsRange }> = [
  { label: '1h', value: '1h' },
  { label: '1d', value: '1d' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '1y', value: '1y' },
  { label: 'All', value: 'all' },
]
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2 md:gap-3">
    <UButton
      color="neutral"
      variant="outline"
      size="sm"
      icon="i-heroicons-arrow-down-tray"
      :disabled="loading"
      @click="emit('export')"
    >
      Export
    </UButton>

    <div class="inline-flex items-center rounded-lg border border-border bg-muted/20 p-1">
      <UButton
        v-for="item in rangeOptions"
        :key="item.value"
        :variant="range === item.value ? 'solid' : 'ghost'"
        color="neutral"
        size="xs"
        class="px-2.5"
        :disabled="loading"
        :aria-label="`Set range ${item.label}`"
        @click="range = item.value"
      >
        {{ item.label }}
      </UButton>
    </div>
  </div>

  <p v-if="range === 'all' && allRangeCapped" class="mt-2 text-xs text-muted-foreground">
    Showing latest indexed range for performance.
  </p>
</template>
