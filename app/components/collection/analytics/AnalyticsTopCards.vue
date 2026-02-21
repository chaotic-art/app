<script setup lang="ts">
import type { AnalyticsRange, AnalyticsTopCardSeries } from '~/types/collectionAnalytics'

defineProps<{
  volumeLoading: boolean
  salesLoading: boolean
  floorLoading: boolean
  volumeValue: string | number | null | undefined
  salesValue: number
  floorValue: string | number | null | undefined
  series: AnalyticsTopCardSeries
  volumeRange: AnalyticsRange
  salesRange: AnalyticsRange
  floorRange: AnalyticsRange
}>()

const emit = defineEmits<{
  'update:volumeRange': [range: AnalyticsRange]
  'update:salesRange': [range: AnalyticsRange]
  'update:floorRange': [range: AnalyticsRange]
}>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
    <AnalyticsTopMetricCard
      title="Volume"
      kind="volume"
      :loading="volumeLoading"
      :value="volumeValue"
      :series="series.volume"
      :range="volumeRange"
      @update:range="emit('update:volumeRange', $event)"
    />

    <AnalyticsTopMetricCard
      title="Sales"
      kind="sales"
      :loading="salesLoading"
      :value="salesValue"
      :range="salesRange"
      @update:range="emit('update:salesRange', $event)"
    />

    <AnalyticsTopMetricCard
      title="Floor Price"
      kind="floorPrice"
      :loading="floorLoading"
      :value="floorValue"
      :series="series.floorPrice"
      :range="floorRange"
      @update:range="emit('update:floorRange', $event)"
    />
  </div>
</template>
