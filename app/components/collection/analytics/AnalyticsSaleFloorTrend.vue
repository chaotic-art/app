<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ActiveElement, ChartEvent, Chart as ChartInstance, TooltipItem } from 'chart.js'
import type {
  AnalyticsListingPoint,
  AnalyticsPriceTrendPoint,
  AnalyticsRange,
  AnalyticsSalePricePoint,
} from '~/types/collectionAnalytics'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { parseISO } from 'date-fns'
import { Scatter } from 'vue-chartjs'
import { sanitizeIpfsUrl } from '~/utils/ipfs'

interface MarketScatterRawPoint {
  x: string
  y: number
  marketPoint: AnalyticsSalePricePoint | AnalyticsListingPoint
  eventType: MarketEventType
}

interface ExternalTooltipContext {
  tooltip: {
    opacity: number
    caretX: number
    caretY: number
    dataPoints: TooltipItem<'scatter'>[]
  }
}

type MarketEventType = 'SALE' | 'LISTING'

interface HoveredMarketPoint {
  point: AnalyticsSalePricePoint | AnalyticsListingPoint
  eventType: MarketEventType
}

const props = defineProps<{
  points: AnalyticsPriceTrendPoint[]
  salesPoints: AnalyticsSalePricePoint[]
  listingPoints: AnalyticsListingPoint[]
  loading: boolean
  allRangeCapped: boolean
  error?: string | null
}>()

const range = defineModel<AnalyticsRange>('range', {
  default: 'all',
})

const REGULAR_SALES_DATASET_INDEX = 1
const LISTINGS_DATASET_INDEX = 2
const FLOOR_DATASET_INDEX = 0
const PREVIEW_CARD_WIDTH = 220
const PREVIEW_CARD_HEIGHT = 250
const PREVIEW_OFFSET = 12
const FLOOR_TOOLTIP_WIDTH = 240
const FLOOR_TOOLTIP_HEIGHT = 92

interface FloorTooltipState {
  label: string
  price: number
}

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
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
)

const { isDarkMode } = useTheme()
const { chainSymbol, currentChain } = useChain()
const { locale } = useI18n()
const chartContainerRef = ref<HTMLElement | null>(null)
const hoveredMarketPoint = ref<HoveredMarketPoint | null>(null)
const hoveredFloor = ref<FloorTooltipState | null>(null)
const previewPosition = ref({ left: 8, top: 8 })
const floorTooltipPosition = ref({ left: 8, top: 8 })
const previewImageErrored = ref(false)
const hideOutliers = ref(true)

const saleTimestampFormatter = computed(() => new Intl.DateTimeFormat(locale.value || undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}))

const floorTimestampFormatter = computed(() => new Intl.DateTimeFormat(locale.value || undefined, {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}))

watch(hoveredMarketPoint, () => {
  previewImageErrored.value = false
})

watch(() => props.salesPoints, () => {
  clearHoveredState()
}, { deep: false })

watch(() => props.listingPoints, () => {
  clearHoveredState()
}, { deep: false })

watch(range, () => {
  clearHoveredState()
})

watch(hideOutliers, () => {
  clearHoveredState()
})

const previewName = computed(() => hoveredMarketPoint.value?.point.nft.name?.trim() || 'Untitled NFT')

const previewImage = computed(() => {
  const image = hoveredMarketPoint.value?.point.nft.image
  if (!image || previewImageErrored.value) {
    return ''
  }

  return sanitizeIpfsUrl(image)
})

const previewPrice = computed(() => {
  if (!hoveredMarketPoint.value) {
    return '-'
  }

  return `${formatMetric(hoveredMarketPoint.value.point.price)} ${chainSymbol.value}`
})

const previewTimestamp = computed(() => {
  if (!hoveredMarketPoint.value) {
    return '-'
  }

  return formatSaleTimestamp(hoveredMarketPoint.value.point.timestamp)
})

const previewEventTypeLabel = computed(() => {
  return hoveredMarketPoint.value?.eventType === 'LISTING' ? 'LISTING' : 'SALE'
})

const floorColor = computed(() => (isDarkMode.value ? '#3B82F6' : '#2563EB'))
const salesColor = computed(() => (isDarkMode.value ? '#38BDF8' : '#0284C7'))
const listingsColor = computed(() => (isDarkMode.value ? '#2DD4BF' : '#0F766E'))

function quantileSorted(sortedValues: number[], quantile: number): number | null {
  if (!sortedValues.length) {
    return null
  }

  const position = (sortedValues.length - 1) * quantile
  const baseIndex = Math.floor(position)
  const fraction = position - baseIndex
  const baseValue = sortedValues[baseIndex]
  if (baseValue === undefined) {
    return null
  }

  const nextValue = sortedValues[baseIndex + 1] ?? baseValue

  return baseValue + fraction * (nextValue - baseValue)
}

function buildOutlierBounds(prices: number[], allowZeroIqrBounds = false): { min: number, max: number } | null {
  const sortedPrices = prices
    .filter(price => Number.isFinite(price))
    .sort((a, b) => a - b)

  if (sortedPrices.length < 4) {
    return null
  }

  const q1 = quantileSorted(sortedPrices, 0.25)
  const q3 = quantileSorted(sortedPrices, 0.75)
  if (q1 === null || q3 === null) {
    return null
  }

  const iqr = q3 - q1
  if (iqr === 0) {
    if (allowZeroIqrBounds) {
      return { min: q1, max: q3 }
    }

    return null
  }

  return {
    min: q1 - 1.5 * iqr,
    max: q3 + 1.5 * iqr,
  }
}

const listingOutlierBounds = computed(() => buildOutlierBounds(props.listingPoints.map(point => point.price), true))

const positiveListingPrices = computed(() => {
  return props.listingPoints
    .map(point => point.price)
    .filter(price => Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b)
})

const positiveListingMedian = computed(() => {
  if (!positiveListingPrices.value.length) {
    return null
  }

  return quantileSorted(positiveListingPrices.value, 0.5)
})

const regularSalesPoints = computed(() => props.salesPoints)

function isOutlierListing(point: AnalyticsListingPoint): boolean {
  const bounds = listingOutlierBounds.value
  if (bounds && (point.price < bounds.min || point.price > bounds.max)) {
    return true
  }

  const median = positiveListingMedian.value
  if (median !== null && median > 0 && point.price > median * 10) {
    return true
  }

  if (positiveListingPrices.value.length <= 3) {
    const smallestPositive = positiveListingPrices.value[0]
    const largestPositive = positiveListingPrices.value[positiveListingPrices.value.length - 1]
    if (smallestPositive && largestPositive && (largestPositive / smallestPositive) >= 3) {
      return point.price > 0
    }
  }

  return false
}

const regularListingPoints = computed(() => props.listingPoints.filter(point => !isOutlierListing(point)))
const outlierListingPoints = computed(() => props.listingPoints.filter(point => isOutlierListing(point)))
const visibleListingPoints = computed(() => {
  if (hideOutliers.value) {
    return regularListingPoints.value
  }

  return [...regularListingPoints.value, ...outlierListingPoints.value]
    .sort((first, second) => first.timestamp.localeCompare(second.timestamp))
})

const hasData = computed(() => {
  return (
    props.points.some(point => point.price !== null)
    || regularSalesPoints.value.length > 0
    || visibleListingPoints.value.length > 0
  )
})

function formatMetric(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-'
  }

  if (Math.abs(value) >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
  }

  if (Math.abs(value) >= 1) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

function formatSaleTimestamp(timestamp: string): string {
  const date = parseISO(timestamp)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return saleTimestampFormatter.value.format(date)
}

function formatFloorTimestamp(dateKey: string, fallbackLabel: string): string {
  const date = parseISO(dateKey)
  if (Number.isNaN(date.getTime())) {
    return fallbackLabel
  }

  return floorTimestampFormatter.value.format(date)
}

function clearHoveredState(): void {
  hoveredMarketPoint.value = null
  hoveredFloor.value = null
}

function toHoveredMarketPoint(raw: unknown): HoveredMarketPoint | null {
  if (!raw || typeof raw !== 'object' || !('marketPoint' in raw) || !('eventType' in raw)) {
    return null
  }

  const point = (raw as MarketScatterRawPoint).marketPoint
  const eventType = (raw as MarketScatterRawPoint).eventType
  if (!point || (eventType !== 'SALE' && eventType !== 'LISTING')) {
    return null
  }

  return {
    point,
    eventType,
  }
}

function resolveHoveredMarketPoint(dataPoints: TooltipItem<'scatter'>[]): HoveredMarketPoint | null {
  const listingPoint = dataPoints.find(item => item.datasetIndex === LISTINGS_DATASET_INDEX)
  if (listingPoint) {
    const listing = visibleListingPoints.value[listingPoint.dataIndex]
    if (listing) {
      return {
        point: listing,
        eventType: 'LISTING',
      }
    }
  }

  const regularSalesPoint = dataPoints.find(item => item.datasetIndex === REGULAR_SALES_DATASET_INDEX)
  if (regularSalesPoint) {
    const sale = regularSalesPoints.value[regularSalesPoint.dataIndex]
    if (sale) {
      return {
        point: sale,
        eventType: 'SALE',
      }
    }
  }

  const fallbackRawPoint = dataPoints
    .map(item => toHoveredMarketPoint(item.raw))
    .find(Boolean)

  if (!fallbackRawPoint) {
    return null
  }

  return fallbackRawPoint
}

function resolveHoveredFloor(dataPoints: TooltipItem<'scatter'>[]): FloorTooltipState | null {
  const floorPoint = dataPoints.find(item => item.datasetIndex === FLOOR_DATASET_INDEX)
  if (!floorPoint) {
    return null
  }

  const point = props.points[floorPoint.dataIndex]
  if (!point || point.price === null) {
    return null
  }

  return {
    label: formatFloorTimestamp(point.dateKey, point.label),
    price: point.price,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function setPreviewPosition(caretX: number, caretY: number): void {
  const container = chartContainerRef.value
  if (!container) {
    return
  }

  const minPadding = 8
  const maxLeft = Math.max(minPadding, container.clientWidth - PREVIEW_CARD_WIDTH - minPadding)
  const maxTop = Math.max(minPadding, container.clientHeight - PREVIEW_CARD_HEIGHT - minPadding)
  const preferredTop = caretY - PREVIEW_CARD_HEIGHT - PREVIEW_OFFSET
  const fallbackTop = caretY + PREVIEW_OFFSET
  const topTarget = preferredTop < minPadding ? fallbackTop : preferredTop

  previewPosition.value = {
    left: clamp(caretX + PREVIEW_OFFSET, minPadding, maxLeft),
    top: clamp(topTarget, minPadding, maxTop),
  }
}

function setFloorTooltipPosition(caretX: number, caretY: number): void {
  const container = chartContainerRef.value
  if (!container) {
    return
  }

  const minPadding = 8
  const maxLeft = Math.max(minPadding, container.clientWidth - FLOOR_TOOLTIP_WIDTH - minPadding)
  const maxTop = Math.max(minPadding, container.clientHeight - FLOOR_TOOLTIP_HEIGHT - minPadding)
  const preferredTop = caretY - FLOOR_TOOLTIP_HEIGHT - PREVIEW_OFFSET
  const fallbackTop = caretY + PREVIEW_OFFSET
  const topTarget = preferredTop < minPadding ? fallbackTop : preferredTop
  const leftTarget = caretX - FLOOR_TOOLTIP_WIDTH / 2

  floorTooltipPosition.value = {
    left: clamp(leftTarget, minPadding, maxLeft),
    top: clamp(topTarget, minPadding, maxTop),
  }
}

function handleExternalTooltip(context: ExternalTooltipContext): void {
  const { tooltip } = context
  if (!tooltip || tooltip.opacity === 0) {
    clearHoveredState()
    return
  }

  const marketPoint = resolveHoveredMarketPoint(tooltip.dataPoints)
  hoveredMarketPoint.value = marketPoint
  if (marketPoint) {
    setPreviewPosition(tooltip.caretX, tooltip.caretY)
    hoveredFloor.value = null
    return
  }

  const floorPoint = resolveHoveredFloor(tooltip.dataPoints)
  hoveredFloor.value = floorPoint
  if (floorPoint) {
    setFloorTooltipPosition(tooltip.caretX, tooltip.caretY)
  }
}

function getMarketPointFromElements(elements: ActiveElement[]): HoveredMarketPoint | null {
  const listingElement = elements.find(item => item.datasetIndex === LISTINGS_DATASET_INDEX)
  if (listingElement) {
    const listing = visibleListingPoints.value[listingElement.index]
    if (listing) {
      return {
        point: listing,
        eventType: 'LISTING',
      }
    }
  }

  const regularSaleElement = elements.find(item => item.datasetIndex === REGULAR_SALES_DATASET_INDEX)
  if (regularSaleElement) {
    const sale = regularSalesPoints.value[regularSaleElement.index]
    if (sale) {
      return {
        point: sale,
        eventType: 'SALE',
      }
    }
  }

  return null
}

function handleChartClick(_event: ChartEvent, elements: ActiveElement[]): void {
  const marketPoint = getMarketPointFromElements(elements)
  const nftId = marketPoint?.point.nft.id

  if (!nftId || !currentChain.value) {
    return
  }

  navigateTo(`/${currentChain.value}/gallery/${nftId}`)
}

function handleChartHover(
  _event: ChartEvent,
  elements: ActiveElement[],
  chart: ChartInstance<'scatter'>,
): void {
  const canvas = chart.canvas
  if (!canvas) {
    return
  }

  const isInteractivePoint = elements.some(item => [REGULAR_SALES_DATASET_INDEX, LISTINGS_DATASET_INDEX].includes(item.datasetIndex))
  canvas.style.cursor = isInteractivePoint ? 'pointer' : 'default'
}

const chartData = computed<any>(() => ({
  labels: props.points.map(point => point.label),
  datasets: [
    {
      type: 'line' as const,
      label: `Floor (${chainSymbol.value})`,
      data: props.points.map(point => ({ x: point.label, y: point.price })),
      borderColor: floorColor.value,
      backgroundColor: 'transparent',
      borderWidth: 2,
      tension: 0.2,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointHitRadius: 16,
      spanGaps: true,
      showLine: true,
    },
    {
      type: 'scatter' as const,
      label: `Sales (${chainSymbol.value})`,
      data: regularSalesPoints.value.map(point => ({
        x: point.label,
        y: point.price,
        marketPoint: point,
        eventType: 'SALE' as const,
      })),
      borderColor: salesColor.value,
      backgroundColor: 'transparent',
      pointBorderColor: salesColor.value,
      pointBackgroundColor: 'transparent',
      pointRadius: 2.5,
      pointHoverRadius: 5,
      pointHitRadius: 14,
      showLine: false,
    },
    {
      type: 'scatter' as const,
      label: `Listings (${chainSymbol.value})`,
      data: visibleListingPoints.value.map(point => ({
        x: point.label,
        y: point.price,
        marketPoint: point,
        eventType: 'LISTING' as const,
      })),
      borderColor: listingsColor.value,
      backgroundColor: 'transparent',
      pointBorderColor: listingsColor.value,
      pointBackgroundColor: 'transparent',
      pointBorderWidth: 1.6,
      pointRadius: 3,
      pointHoverRadius: 5.5,
      pointHitRadius: 16,
      pointStyle: 'rect' as const,
      showLine: false,
    },
  ],
}))

const chartOptions = computed<any>(() => {
  const textColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.72)' : 'rgba(17, 24, 39, 0.72)'
  const gridColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
    onHover: handleChartHover,
    interaction: {
      intersect: true,
      mode: 'nearest' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        external: handleExternalTooltip,
      },
    },
    scales: {
      x: {
        type: 'category' as const,
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
      y: {
        beginAtZero: true,
        grace: '5%',
        ticks: {
          color: textColor,
          maxTicksLimit: 5,
        },
        grid: {
          color: gridColor,
        },
      },
    },
  }
})
</script>

<template>
  <UCard class="rounded-xl h-full">
    <div class="mb-3 flex items-start justify-between gap-2">
      <h3 class="text-base md:text-lg font-semibold">
        Listing and Floor price
      </h3>

      <div class="flex items-center gap-1">
        <UDropdownMenu :items="rangeItems" :content="{ align: 'end' }" :ui="{ content: 'w-24' }">
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            trailing-icon="i-heroicons-chevron-down"
            aria-label="Set Listing and Floor price range"
          >
            {{ range === 'all' ? 'All' : range }}
          </UButton>
        </UDropdownMenu>

        <UPopover :content="{ align: 'end', side: 'bottom', sideOffset: 8 }">
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-heroicons-cog-6-tooth"
            aria-label="Open chart settings"
          />

          <template #content>
            <div class="p-3 min-w-40">
              <label class="flex items-center gap-2 text-sm text-foreground">
                <UCheckbox v-model="hideOutliers" />
                <span>Hide Outliers</span>
              </label>
            </div>
          </template>
        </UPopover>
      </div>
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
        <UIcon name="i-heroicons-presentation-chart-line" class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <p class="font-medium">
          No sale floor data in selected range
        </p>
      </div>
    </div>

    <div
      v-else
      ref="chartContainerRef"
      class="relative h-[320px] md:h-[360px]"
      @mouseleave="clearHoveredState"
    >
      <div class="pointer-events-none absolute right-3 top-2 z-10 max-w-[52%]">
        <div class="flex flex-wrap justify-end gap-x-3 gap-y-1 rounded-md bg-background/70 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur-sm">
          <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span class="h-0.5 w-4 rounded" :style="{ backgroundColor: floorColor }" />
            Floor
          </span>
          <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span class="h-2.5 w-2.5 rounded-full border" :style="{ borderColor: salesColor }" />
            Sales
          </span>
          <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span class="h-2.5 w-2.5 rounded-[2px] border" :style="{ borderColor: listingsColor }" />
            Listings
          </span>
        </div>
      </div>

      <ClientOnly>
        <Scatter :data="chartData" :options="chartOptions" />
        <template #fallback>
          <USkeleton class="h-[320px] md:h-[360px] w-full rounded-xl" />
        </template>
      </ClientOnly>

      <div
        v-if="hoveredMarketPoint"
        class="pointer-events-none absolute z-20 w-[220px] overflow-hidden rounded-xl border border-border/80 bg-background/95 p-2 shadow-xl backdrop-blur"
        :style="{ left: `${previewPosition.left}px`, top: `${previewPosition.top}px` }"
      >
        <div class="aspect-square w-full overflow-hidden rounded-lg border border-border/70 bg-muted/40">
          <img
            v-if="previewImage"
            :src="previewImage"
            :alt="previewName"
            class="h-full w-full object-cover"
            @error="previewImageErrored = true"
          >
          <div v-else class="flex h-full w-full items-center justify-center">
            <UIcon name="i-heroicons-photo" class="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div class="mt-2 space-y-1 px-0.5">
          <p class="text-[11px] uppercase tracking-wide text-muted-foreground">
            {{ previewEventTypeLabel }}
          </p>
          <p class="line-clamp-1 text-sm font-semibold">
            {{ previewName }}
          </p>
          <p class="text-sm font-medium tabular-nums">
            {{ previewPrice }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ previewTimestamp }}
          </p>
        </div>
      </div>

      <div
        v-if="hoveredFloor && !hoveredMarketPoint"
        class="pointer-events-none absolute z-10 w-[240px] rounded-xl border border-border/80 bg-background/95 px-4 py-3 shadow-lg backdrop-blur"
        :style="{ left: `${floorTooltipPosition.left}px`, top: `${floorTooltipPosition.top}px` }"
      >
        <p class="text-sm tabular-nums text-foreground/90">
          {{ hoveredFloor.label }}
        </p>
        <p class="mt-2 text-sm tabular-nums text-foreground/90">
          FLOOR: {{ formatMetric(hoveredFloor.price) }} {{ chainSymbol }}
        </p>
      </div>
    </div>

    <p v-if="range === 'all' && allRangeCapped" class="mt-2 text-xs text-muted-foreground">
      Showing latest indexed range for performance.
    </p>
  </UCard>
</template>
