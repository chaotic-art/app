<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AnalyticsMiniSeriesPoint, AnalyticsRange } from '~/types/collectionAnalytics'
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
} from 'chart.js'
import { Line } from 'vue-chartjs'

type TopMetricKind = 'volume' | 'sales' | 'floorPrice'

const props = defineProps<{
  title: string
  value: string | number | null | undefined
  series?: AnalyticsMiniSeriesPoint[]
  range: AnalyticsRange
  loading: boolean
  kind: TopMetricKind
}>()

const emit = defineEmits<{
  'update:range': [range: AnalyticsRange]
}>()

ChartJS.register(
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
)

const { isDarkMode } = useTheme()

const rangeItems = computed<DropdownMenuItem[]>(() => [
  [
    { label: '1h', onSelect: () => emit('update:range', '1h') },
    { label: '1d', onSelect: () => emit('update:range', '1d') },
    { label: '7d', onSelect: () => emit('update:range', '7d') },
    { label: '30d', onSelect: () => emit('update:range', '30d') },
    { label: '1y', onSelect: () => emit('update:range', '1y') },
    { label: 'All', onSelect: () => emit('update:range', 'all') },
  ],
])

const chartSeries = computed(() => {
  const series = props.series ?? []

  if (props.kind === 'sales') {
    return []
  }

  if (props.kind !== 'floorPrice') {
    return series
  }

  const firstIndex = series.findIndex(point => point.value !== null)
  if (firstIndex <= 0) {
    return series
  }

  return series.slice(firstIndex)
})

const hasSeriesData = computed(() => {
  if (!chartSeries.value.length) {
    return false
  }

  if (props.kind === 'floorPrice') {
    return chartSeries.value.some(point => point.value !== null)
  }

  return chartSeries.value.some(point => (point.value ?? 0) > 0)
})

const metricColor = computed(() => {
  if (props.kind === 'volume') {
    return isDarkMode.value ? '#22C55E' : '#16A34A'
  }

  if (props.kind === 'floorPrice') {
    return isDarkMode.value ? '#F43F5E' : '#E11D48'
  }

  return isDarkMode.value ? '#A3A3A3' : '#737373'
})

const chartData = computed(() => ({
  labels: chartSeries.value.map(point => point.label),
  datasets: [
    {
      data: chartSeries.value.map(point => point.value),
      borderColor: metricColor.value,
      backgroundColor: 'transparent',
      borderWidth: 2,
      tension: 0.26,
      pointRadius: 0,
      pointHoverRadius: 2.5,
      spanGaps: true,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
      beginAtZero: true,
    },
  },
}))
</script>

<template>
  <UCard class="rounded-xl h-full">
    <div class="flex items-start justify-between gap-2">
      <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {{ title }}
      </p>

      <UDropdownMenu :items="rangeItems" :content="{ align: 'end' }" :ui="{ content: 'w-24' }">
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          trailing-icon="i-heroicons-chevron-down"
          :aria-label="`Set ${title} range`"
          :disabled="loading"
        >
          {{ range === 'all' ? 'All' : range }}
        </UButton>
      </UDropdownMenu>
    </div>

    <div class="mt-2 min-h-12">
      <template v-if="loading">
        <USkeleton class="h-11 w-36 rounded-md" />
      </template>
      <div
        v-else-if="kind === 'sales'"
        class="text-4xl leading-none font-semibold tabular-nums"
      >
        {{ value ?? 0 }}
      </div>
      <div v-else class="text-4xl leading-none font-semibold tabular-nums">
        <Money v-if="value !== null && value !== undefined" :value="value" inline />
        <span v-else>-</span>
      </div>
    </div>

    <div v-if="kind !== 'sales'" class="mt-3 h-10">
      <template v-if="loading">
        <USkeleton class="h-10 w-full rounded-md" />
      </template>

      <template v-else-if="hasSeriesData">
        <ClientOnly>
          <Line :data="chartData" :options="chartOptions" />
          <template #fallback>
            <USkeleton class="h-10 w-full rounded-md" />
          </template>
        </ClientOnly>
      </template>

      <p v-else class="pt-3 text-[11px] text-muted-foreground">
        No data in range
      </p>
    </div>
  </UCard>
</template>
