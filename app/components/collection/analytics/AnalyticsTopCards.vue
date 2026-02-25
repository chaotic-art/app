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
}>()

const volumeRange = defineModel<AnalyticsRange>('volumeRange', { required: true })
const salesRange = defineModel<AnalyticsRange>('salesRange', { required: true })
const floorRange = defineModel<AnalyticsRange>('floorRange', { required: true })

const { t } = useI18n()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
    <AnalyticsTopMetricCard
      v-model:range="volumeRange"
      :title="t('analytics.topCards.volume')"
      kind="volume"
      :loading="volumeLoading"
      :value="volumeValue"
      :series="series.volume"
    />

    <AnalyticsTopMetricCard
      v-model:range="salesRange"
      :title="t('analytics.topCards.sales')"
      kind="sales"
      :loading="salesLoading"
      :value="salesValue"
    />

    <AnalyticsTopMetricCard
      v-model:range="floorRange"
      :title="t('analytics.topCards.floorPrice')"
      kind="floorPrice"
      :loading="floorLoading"
      :value="floorValue"
      :series="series.floorPrice"
    />
  </div>
</template>
