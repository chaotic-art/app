<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AnalyticsPriceTrendPoint, AnalyticsRange, AnalyticsTrendPoint } from '~/types/collectionAnalytics'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar } from 'vue-chartjs'

const props = defineProps<{
  points: AnalyticsTrendPoint[]
  avgPricePoints: AnalyticsPriceTrendPoint[]
  loading: boolean
  allRangeCapped: boolean
  error?: string | null
}>()

const range = defineModel<AnalyticsRange>('range', {
  default: 'all',
})

const rangeItems = computed<DropdownMenuItem[]>(() => [
  [
    { label: '1h', onSelect: () => (range.value = '1h') },
    { label: '1d', onSelect: () => (range.value = '1d') },
    { label: '7d', onSelect: () => (range.value = '7d') },
    { label: '30d', onSelect: () => (range.value = '30d') },
    { label: '1y', onSelect: () => (range.value = '1y') },
    { label: 'All', onSelect: () => (range.value = 'all') },
  ],
])

ChartJS.register(
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
)

const { isDarkMode } = useTheme()
const { chainSymbol } = useChain()

const movingAveragePricePoints = computed<Array<number | null>>(() => {
  const rawValues = props.avgPricePoints.map(point => point.price)
  const windowSize = range.value === '1h' || range.value === '1d'
    ? 3
    : range.value === '7d'
      ? 4
      : 6

  return rawValues.map((value, index) => {
    if (value === null) {
      return null
    }

    let sum = 0
    let count = 0
    const from = Math.max(0, index - windowSize + 1)
    for (let cursor = from; cursor <= index; cursor += 1) {
      const current = rawValues[cursor]
      if (current === null || current === undefined) {
        continue
      }

      sum += current
      count += 1
    }

    return count > 0 ? sum / count : null
  })
})

const movingAvgValues = computed<number[]>(() => {
  return movingAveragePricePoints.value.filter((value): value is number => value !== null)
})

const yPriceBounds = computed(() => {
  if (!movingAvgValues.value.length) {
    return { min: undefined as number | undefined, max: undefined as number | undefined }
  }

  const min = Math.min(...movingAvgValues.value)
  const max = Math.max(...movingAvgValues.value)

  if (min === max) {
    const pad = min === 0 ? 1 : Math.abs(min) * 0.1
    return { min: min - pad, max: max + pad }
  }

  const span = max - min
  return {
    min: Math.max(0, min - span * 0.12),
    max: max + span * 0.12,
  }
})

const hasData = computed(() => {
  const hasVolume = props.points.some(point => point.volume > 0)
  const hasAvgPrice = movingAveragePricePoints.value.some(point => point !== null)
  return hasVolume || hasAvgPrice
})

const chartData = computed<any>(() => ({
  labels: props.points.map(point => point.label),
  datasets: [
    {
      type: 'line' as const,
      label: `Moving Avg. Price (${chainSymbol.value})`,
      data: movingAveragePricePoints.value,
      borderColor: isDarkMode.value ? '#3B82F6' : '#2563EB',
      backgroundColor: 'transparent',
      yAxisID: 'yPrice',
      borderWidth: 2.5,
      tension: 0.34,
      cubicInterpolationMode: 'monotone' as const,
      pointRadius: 0,
      pointHitRadius: 24,
      pointHoverRadius: 3,
      spanGaps: true,
      order: 0,
    },
    {
      type: 'bar' as const,
      label: `Vol (${chainSymbol.value})`,
      data: props.points.map(point => point.volume),
      backgroundColor: isDarkMode.value ? 'rgba(163, 163, 163, 0.34)' : 'rgba(113, 113, 122, 0.25)',
      borderRadius: 3,
      yAxisID: 'yVolume',
      maxBarThickness: 9,
      order: 1,
    },
  ],
}))

const chartOptions = computed<any>(() => {
  const textColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.72)' : 'rgba(17, 24, 39, 0.72)'
  const gridColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
      axis: 'x' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        filter: (item: { datasetIndex: number }) => item.datasetIndex === 0,
        backgroundColor: isDarkMode.value ? 'rgba(10, 10, 12, 0.94)' : 'rgba(255, 255, 255, 0.98)',
        borderColor: isDarkMode.value ? 'rgba(255, 255, 255, 0.18)' : 'rgba(15, 23, 42, 0.16)',
        borderWidth: 1,
        bodyColor: isDarkMode.value ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.92)',
        titleColor: isDarkMode.value ? 'rgba(255, 255, 255, 0.98)' : 'rgba(2, 6, 23, 0.98)',
        cornerRadius: 10,
        padding: 12,
        titleSpacing: 8,
        titleMarginBottom: 8,
        bodySpacing: 6,
        caretSize: 0,
        caretPadding: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          autoSkip: true,
          maxTicksLimit: range.value === '1h' ? 8 : range.value === '1d' ? 12 : 10,
          maxRotation: 0,
        },
        grid: {
          color: gridColor,
          display: false,
        },
      },
      yPrice: {
        position: 'left' as const,
        beginAtZero: false,
        suggestedMin: yPriceBounds.value.min,
        suggestedMax: yPriceBounds.value.max,
        ticks: {
          color: textColor,
          maxTicksLimit: 5,
        },
        grid: {
          color: gridColor,
        },
      },
      yVolume: {
        position: 'right' as const,
        beginAtZero: true,
        ticks: {
          color: textColor,
          maxTicksLimit: 4,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }
})
</script>

<template>
  <UCard class="rounded-xl h-full">
    <div class="mb-3 flex items-start justify-between gap-2">
      <div>
        <h3 class="text-base md:text-lg font-semibold">
          Volume & Price
        </h3>
      </div>

      <UDropdownMenu :items="rangeItems" :content="{ align: 'end' }" :ui="{ content: 'w-24' }">
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          trailing-icon="i-heroicons-chevron-down"
          aria-label="Set Volume and Price range"
        >
          {{ range === 'all' ? 'All' : range }}
        </UButton>
      </UDropdownMenu>
    </div>

    <div v-if="loading" class="space-y-2">
      <USkeleton class="h-[320px] md:h-[360px] w-full rounded-xl" />
    </div>

    <div v-else-if="error" class="flex h-[320px] md:h-[360px] items-center justify-center text-center">
      <div>
        <UIcon name="i-heroicons-exclamation-triangle" class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <p class="font-medium">
          {{ error }}
        </p>
      </div>
    </div>

    <div v-else-if="!hasData" class="flex h-[320px] md:h-[360px] items-center justify-center text-center">
      <div>
        <UIcon name="i-heroicons-chart-bar-square" class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <p class="font-medium">
          No data in selected range
        </p>
      </div>
    </div>

    <div v-else class="h-[320px] md:h-[360px]">
      <ClientOnly>
        <Bar :data="chartData" :options="chartOptions" />
        <template #fallback>
          <USkeleton class="h-[320px] md:h-[360px] w-full rounded-xl" />
        </template>
      </ClientOnly>
    </div>

    <p v-if="range === 'all' && allRangeCapped" class="mt-2 text-xs text-muted-foreground">
      Showing latest indexed range for performance.
    </p>
  </UCard>
</template>
