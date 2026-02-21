<script setup lang="ts">
import type { AnalyticsRange, AnalyticsTopCardSeries } from '~/types/collectionAnalytics'

interface Props {
  collectionId: string
  collectionName?: string
  floorPrice?: number | string | null
  ownersCount?: number | null
}

const props = defineProps<Props>()

const globalRange = ref<AnalyticsRange>('all')
const volumeCardRange = ref<AnalyticsRange>('all')
const salesCardRange = ref<AnalyticsRange>('all')
const floorCardRange = ref<AnalyticsRange>('all')
const primaryChartRange = ref<AnalyticsRange>('all')
const secondaryChartRange = ref<AnalyticsRange>('all')

watch(globalRange, (nextRange) => {
  volumeCardRange.value = nextRange
  salesCardRange.value = nextRange
  floorCardRange.value = nextRange
  primaryChartRange.value = nextRange
  secondaryChartRange.value = nextRange
}, { immediate: true })

const globalAnalytics = useCollectionAnalytics({
  collectionId: computed(() => props.collectionId),
  collectionName: computed(() => props.collectionName),
  range: globalRange,
  floorPrice: computed(() => props.floorPrice),
  ownersCount: computed(() => props.ownersCount),
})

const volumeCardAnalytics = useCollectionAnalytics({
  collectionId: computed(() => props.collectionId),
  collectionName: computed(() => props.collectionName),
  range: volumeCardRange,
  floorPrice: computed(() => props.floorPrice),
  ownersCount: computed(() => props.ownersCount),
})

const salesCardAnalytics = useCollectionAnalytics({
  collectionId: computed(() => props.collectionId),
  collectionName: computed(() => props.collectionName),
  range: salesCardRange,
  floorPrice: computed(() => props.floorPrice),
  ownersCount: computed(() => props.ownersCount),
})

const floorCardAnalytics = useCollectionAnalytics({
  collectionId: computed(() => props.collectionId),
  collectionName: computed(() => props.collectionName),
  range: floorCardRange,
  floorPrice: computed(() => props.floorPrice),
  ownersCount: computed(() => props.ownersCount),
})

const primaryChartAnalytics = useCollectionAnalytics({
  collectionId: computed(() => props.collectionId),
  collectionName: computed(() => props.collectionName),
  range: primaryChartRange,
  floorPrice: computed(() => props.floorPrice),
  ownersCount: computed(() => props.ownersCount),
})

const secondaryChartAnalytics = useCollectionAnalytics({
  collectionId: computed(() => props.collectionId),
  collectionName: computed(() => props.collectionName),
  range: secondaryChartRange,
  floorPrice: computed(() => props.floorPrice),
  ownersCount: computed(() => props.ownersCount),
})

const toolbarLoading = computed(() => globalAnalytics.loading.value)

const topCardSeries = computed<AnalyticsTopCardSeries>(() => ({
  volume: volumeCardAnalytics.volumeMiniSeries.value,
  floorPrice: floorCardAnalytics.floorPriceMiniSeries.value,
}))

const combinedAllRangeCapped = computed(() => globalAnalytics.allRangeCapped.value)
</script>

<template>
  <div class="space-y-4 md:space-y-6">
    <AnalyticsToolbar
      v-model:range="globalRange"
      :all-range-capped="combinedAllRangeCapped"
      :loading="toolbarLoading"
      @export="globalAnalytics.exportAnalytics"
    />

    <AnalyticsTopCards
      :volume-loading="volumeCardAnalytics.loading.value"
      :sales-loading="salesCardAnalytics.loading.value"
      :floor-loading="floorCardAnalytics.loading.value"
      :volume-value="volumeCardAnalytics.kpis.value.volume"
      :sales-value="salesCardAnalytics.kpis.value.sales"
      :floor-value="floorCardAnalytics.kpis.value.currentFloor"
      :series="topCardSeries"
      :volume-range="volumeCardRange"
      :sales-range="salesCardRange"
      :floor-range="floorCardRange"
      @update:volume-range="volumeCardRange = $event"
      @update:sales-range="salesCardRange = $event"
      @update:floor-range="floorCardRange = $event"
    />

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div class="xl:col-span-4">
        <AnalyticsTrends
          v-model:range="primaryChartRange"
          :points="primaryChartAnalytics.trendPoints.value"
          :avg-price-points="primaryChartAnalytics.averageSalePriceTrendPoints.value"
          :loading="primaryChartAnalytics.loading.value"
          :all-range-capped="primaryChartAnalytics.allRangeCapped.value"
          :error="primaryChartAnalytics.salesError.value"
        />
      </div>

      <div class="xl:col-span-8">
        <AnalyticsSaleFloorTrend
          v-model:range="secondaryChartRange"
          :points="secondaryChartAnalytics.listingFloorTrendPoints.value"
          :sales-points="secondaryChartAnalytics.salePricePoints.value"
          :listing-points="secondaryChartAnalytics.listingPoints.value"
          :loading="secondaryChartAnalytics.loading.value"
          :all-range-capped="secondaryChartAnalytics.allRangeCapped.value"
          :error="secondaryChartAnalytics.salesError.value"
        />
      </div>
    </div>
  </div>
</template>
