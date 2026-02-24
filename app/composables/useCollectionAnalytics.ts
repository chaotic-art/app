import type { CollectionAnalyticsMarketEventsData } from '~/graphql/queries/collections'
import type {
  AnalyticsKpis,
  AnalyticsListingPoint,
  AnalyticsMiniSeriesPoint,
  AnalyticsPriceTrendPoint,
  AnalyticsRange,
  AnalyticsSalePricePoint,
  AnalyticsTrendPoint,
} from '~/types/collectionAnalytics'
import {
  eachDayOfInterval,
  eachHourOfInterval,
  endOfDay,
  endOfHour,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfHour,
  subDays,
  subHours,
  subYears,
} from 'date-fns'
import { collectionAnalyticsMarketEvents } from '~/graphql/queries/collections'
import { formatDisplayNumber } from '~/utils/format/balance'

interface UseCollectionAnalyticsOptions {
  collectionId: MaybeRef<string | undefined>
  range: MaybeRef<AnalyticsRange>
  collectionName?: MaybeRef<string | undefined>
  floorPrice?: MaybeRef<number | string | null | undefined>
  ownersCount?: MaybeRef<number | null | undefined>
}

type MarketEvent = CollectionAnalyticsMarketEventsData['events'][number]
type MarketInteraction = 'BUY' | 'LIST' | 'UNLIST'

interface AnalyticsSaleRow {
  id: string
  timestamp: string
  price: string
  nftId: string
  nftName: string | null
  nftImage: string | null
  caller: string
}

interface AnalyticsMarketEventRow {
  id: string
  nftId: string
  nftName: string | null
  nftImage: string | null
  interaction: MarketInteraction
  timestamp: string
  price: string
  caller: string
}

interface AnalyticsDateRangeWindow {
  start: Date
  end: Date
}

interface AnalyticsExportFile {
  name: string
  content: string
}

const MAX_MARKET_EVENTS = 5000
const ANALYTICS_QUERY_CACHE_TTL_MS = 15_000

interface MarketEventsQueryResult {
  rows: AnalyticsMarketEventRow[]
  allRangeCapped: boolean
}

interface MarketEventsCacheEntry extends MarketEventsQueryResult {
  expiresAt: number
}

const marketEventsCache = new Map<string, MarketEventsCacheEntry>()
const marketEventsInFlight = new Map<string, Promise<MarketEventsQueryResult>>()

function isHourlyRange(range: AnalyticsRange): boolean {
  return range === '1h' || range === '1d'
}

function rangeStart(range: AnalyticsRange, now: Date): Date {
  if (range === '1h') {
    return startOfHour(subHours(now, 1))
  }

  if (range === '1d') {
    return startOfHour(subDays(now, 1))
  }

  if (range === '7d') {
    return startOfDay(subDays(now, 6))
  }

  if (range === '30d') {
    return startOfDay(subDays(now, 29))
  }

  if (range === '1y') {
    return startOfDay(subYears(now, 1))
  }

  return startOfDay(subDays(now, 6))
}

function rangeEnd(range: AnalyticsRange, now: Date): Date {
  return isHourlyRange(range) ? endOfHour(now) : endOfDay(now)
}

function toBigInt(value: string | number | null | undefined): bigint {
  if (value === null || value === undefined) {
    return BigInt(0)
  }

  try {
    return BigInt(String(value))
  }
  catch {
    return BigInt(0)
  }
}

function formatRawAmountForExport(raw: string | number | null | undefined, decimals: number, fractionDigits = 4): string {
  if (raw === null || raw === undefined) {
    return '-'
  }

  const normalized = String(raw).trim()
  if (!normalized) {
    return '-'
  }

  if (!/^-?\d+$/.test(normalized)) {
    const numeric = Number(normalized)
    if (!Number.isFinite(numeric)) {
      return '-'
    }

    return numeric.toLocaleString(undefined, { maximumFractionDigits: fractionDigits })
  }

  const negative = normalized.startsWith('-')
  const digits = negative ? normalized.slice(1) : normalized
  if (!digits) {
    return '0'
  }

  const safeDecimals = Math.max(0, decimals)
  if (safeDecimals === 0) {
    return `${negative ? '-' : ''}${digits}`
  }

  const padded = digits.padStart(safeDecimals + 1, '0')
  const integerPart = padded.slice(0, -safeDecimals) || '0'
  const fractionPart = padded
    .slice(-safeDecimals)
    .slice(0, fractionDigits)
    .replace(/0+$/g, '')

  return `${negative ? '-' : ''}${integerPart}${fractionPart ? `.${fractionPart}` : ''}`
}

function safeIso(date: Date): string {
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

function toTimestampLte(range: AnalyticsRange): string | undefined {
  if (range === 'all') {
    return undefined
  }

  return safeIso(rangeEnd(range, new Date()))
}

function marketEventsRequestKey(id: string, chain: string, range: AnalyticsRange): string {
  const timestampLte = toTimestampLte(range) || 'none'
  return `${chain}::${id}::${timestampLte}`
}

function normalizeMarketEventsRows(events: CollectionAnalyticsMarketEventsData['events'] | undefined): AnalyticsMarketEventRow[] {
  return (events || [])
    .map((event: MarketEvent) => ({
      id: event.id,
      nftId: event.nft?.id || '',
      nftName: event.nft?.meta?.name || event.nft?.name || null,
      nftImage: event.nft?.meta?.image || event.nft?.image || null,
      interaction: (event.interaction || 'BUY') as MarketInteraction,
      timestamp: String(event.timestamp || ''),
      price: event.meta || '0',
      caller: event.caller || '',
    }))
    .filter(event => Boolean(event.timestamp) && Boolean(event.nftId))
    .sort((first, second) => new Date(first.timestamp).getTime() - new Date(second.timestamp).getTime())
}

function rangeLabel(date: Date, range: AnalyticsRange): string {
  if (isHourlyRange(range)) {
    return format(date, 'HH:mm')
  }

  return format(date, 'MMM d')
}

function rangeBucketKey(date: Date, range: AnalyticsRange): string {
  if (isHourlyRange(range)) {
    return format(date, 'yyyy-MM-dd HH:00')
  }

  return format(date, 'yyyy-MM-dd')
}

function buildIntervals(window: AnalyticsDateRangeWindow, range: AnalyticsRange): Date[] {
  if (isHourlyRange(range)) {
    return eachHourOfInterval({
      start: startOfHour(window.start),
      end: endOfHour(window.end),
    })
  }

  return eachDayOfInterval({
    start: startOfDay(window.start),
    end: endOfDay(window.end),
  })
}

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }

  const normalized = String(value)
  const firstNonWhitespace = normalized.trimStart().charAt(0)
  const sanitized = /^[=+\-@]$/.test(firstNonWhitespace)
    ? `'${normalized}`
    : normalized

  if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n')) {
    return `"${sanitized.replace(/"/g, '""')}"`
  }

  return sanitized
}

function toCsv(rows: Array<Array<string | number | null | undefined>>): string {
  return rows.map(row => row.map(escapeCsvCell).join(',')).join('\n')
}

function downloadBlob(blob: Blob, filename: string): void {
  if (!import.meta.client) {
    return
  }

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function downloadCsv(csv: string, filename: string): void {
  if (!import.meta.client) {
    return
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

function slugifyCollectionName(name: string | undefined): string {
  const fallback = 'collection'
  if (!name) {
    return fallback
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

function toChartAmount(raw: string, decimals: number): number {
  const divisor = Number(10 ** decimals)
  // Analytics values are expected to stay well below MAX_SAFE_INTEGER in this domain.
  // If larger values become possible, switch to string-based decimal formatting.
  return Number(toBigInt(raw)) / divisor
}

async function downloadZipBundle(files: AnalyticsExportFile[], filename: string): Promise<void> {
  const { downloadZip } = await import('client-zip')
  const zipResponse = downloadZip(files.map(file => ({
    name: file.name,
    input: file.content,
  })))
  const zipBlob = await zipResponse.blob()
  downloadBlob(zipBlob, filename)
}

export function useCollectionAnalytics(options: UseCollectionAnalyticsOptions) {
  const { $apolloClient } = useNuxtApp()
  const { currentChain, decimals } = useChain()
  const apolloClient = $apolloClient as typeof $apolloClient | undefined

  const collectionId = computed(() => unref(options.collectionId))
  const selectedRange = computed(() => unref(options.range))

  const salesLoading = ref(true)
  const salesResolved = ref(false)
  const salesError = ref<string | null>(null)
  const allRangeCapped = ref(false)
  const marketEventsRows = ref<AnalyticsMarketEventRow[]>([])
  let salesRequestId = 0

  async function fetchMarketEvents(id: string, chain: string, range: AnalyticsRange): Promise<MarketEventsQueryResult> {
    const key = marketEventsRequestKey(id, chain, range)
    const now = Date.now()
    const cached = marketEventsCache.get(key)

    if (cached) {
      if (cached.expiresAt > now) {
        return {
          rows: cached.rows,
          allRangeCapped: cached.allRangeCapped,
        }
      }

      marketEventsCache.delete(key)
    }

    const inFlight = marketEventsInFlight.get(key)
    if (inFlight) {
      return inFlight
    }

    // TODO(analytics): This request is capped and only upper-bounded by timestampLte.
    // Add timestampGte + limit+1 truncation detection to avoid silent undercounting in busy bounded ranges.
    const request = apolloClient!.query<CollectionAnalyticsMarketEventsData>({
      query: collectionAnalyticsMarketEvents,
      variables: {
        id,
        limit: MAX_MARKET_EVENTS,
        timestampLte: toTimestampLte(range),
      },
      context: {
        endpoint: chain,
      },
      fetchPolicy: 'network-only',
    }).then(({ data }) => {
      const rows = normalizeMarketEventsRows(data?.events)
      const result = {
        rows,
        allRangeCapped: range === 'all' && rows.length >= MAX_MARKET_EVENTS,
      }

      marketEventsCache.set(key, {
        ...result,
        expiresAt: Date.now() + ANALYTICS_QUERY_CACHE_TTL_MS,
      })

      return result
    }).finally(() => {
      marketEventsInFlight.delete(key)
    })

    marketEventsInFlight.set(key, request)
    return request
  }

  watch([collectionId, currentChain, selectedRange], async ([id, chain, range]) => {
    if (!import.meta.client) {
      return
    }

    const requestId = ++salesRequestId

    if (!apolloClient) {
      salesLoading.value = false
      salesResolved.value = true
      salesError.value = 'Analytics client is not available.'
      return
    }

    if (!id) {
      salesLoading.value = false
      salesResolved.value = true
      salesError.value = null
      marketEventsRows.value = []
      allRangeCapped.value = false
      return
    }

    salesLoading.value = true
    salesResolved.value = false
    salesError.value = null

    try {
      const result = await fetchMarketEvents(id, chain, range)

      if (requestId !== salesRequestId) {
        return
      }

      marketEventsRows.value = result.rows
      allRangeCapped.value = result.allRangeCapped
    }
    catch (error) {
      if (requestId !== salesRequestId) {
        return
      }

      console.error('Failed to fetch collection analytics sales:', error)
      salesError.value = 'Unable to load sales data right now.'
      marketEventsRows.value = []
      allRangeCapped.value = false
    }
    finally {
      if (requestId === salesRequestId) {
        salesLoading.value = false
        salesResolved.value = true
      }
    }
  }, { immediate: true })

  const salesRows = computed<AnalyticsSaleRow[]>(() => {
    return marketEventsRows.value
      .filter(event => event.interaction === 'BUY')
      .map(event => ({
        id: event.id,
        timestamp: event.timestamp,
        price: event.price,
        nftId: event.nftId,
        nftName: event.nftName,
        nftImage: event.nftImage,
        caller: event.caller,
      }))
  })

  const rangeWindow = computed<AnalyticsDateRangeWindow | null>(() => {
    if (selectedRange.value === 'all') {
      if (!marketEventsRows.value.length) {
        return null
      }

      const oldest = marketEventsRows.value[0]
      const latest = marketEventsRows.value[marketEventsRows.value.length - 1]
      if (!oldest) {
        return null
      }
      if (!latest) {
        return null
      }

      const start = startOfDay(parseISO(oldest.timestamp))
      const end = endOfDay(parseISO(latest.timestamp))

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null
      }

      return { start, end }
    }

    const now = new Date()
    return {
      start: rangeStart(selectedRange.value, now),
      end: rangeEnd(selectedRange.value, now),
    }
  })

  const salesInRange = computed(() => {
    if (!rangeWindow.value || selectedRange.value === 'all') {
      return salesRows.value
    }

    return salesRows.value.filter((event) => {
      const eventDate = parseISO(event.timestamp)
      if (Number.isNaN(eventDate.getTime())) {
        return false
      }

      return isWithinInterval(eventDate, {
        start: rangeWindow.value!.start,
        end: rangeWindow.value!.end,
      })
    })
  })

  const marketEventsInRange = computed(() => {
    if (!rangeWindow.value || selectedRange.value === 'all') {
      return marketEventsRows.value
    }

    return marketEventsRows.value.filter((event) => {
      const eventDate = parseISO(event.timestamp)
      if (Number.isNaN(eventDate.getTime())) {
        return false
      }

      return isWithinInterval(eventDate, {
        start: rangeWindow.value!.start,
        end: rangeWindow.value!.end,
      })
    })
  })

  const rangeVolume = computed(() => {
    return salesInRange.value
      .map(event => toBigInt(event.price))
      .reduce((acc, price) => acc + price, BigInt(0))
  })

  const saleFloor = computed<string | null>(() => {
    const positiveSales = salesInRange.value.filter(event => toBigInt(event.price) > BigInt(0))

    if (!positiveSales.length) {
      return null
    }

    const min = positiveSales
      .map(event => toBigInt(event.price))
      .reduce((acc, current) => (current < acc ? current : acc))

    return min.toString()
  })

  const trendPoints = computed<AnalyticsTrendPoint[]>(() => {
    if (!rangeWindow.value) {
      return []
    }

    const intervals = buildIntervals(rangeWindow.value, selectedRange.value)
    const grouped = new Map<string, { volume: bigint, sales: number }>(
      intervals.map(point => [rangeBucketKey(point, selectedRange.value), { volume: BigInt(0), sales: 0 }]),
    )

    salesInRange.value.forEach((event) => {
      const eventDate = parseISO(event.timestamp)
      if (Number.isNaN(eventDate.getTime())) {
        return
      }

      const key = rangeBucketKey(eventDate, selectedRange.value)
      const current = grouped.get(key)
      if (!current) {
        return
      }

      current.volume += toBigInt(event.price)
      current.sales += 1
    })

    return intervals.map((point) => {
      const key = rangeBucketKey(point, selectedRange.value)
      const value = grouped.get(key) || { volume: BigInt(0), sales: 0 }

      return {
        dateKey: key,
        label: rangeLabel(point, selectedRange.value),
        volume: toChartAmount(value.volume.toString(), decimals.value),
        sales: value.sales,
      }
    })
  })

  const averageSalePriceTrendPoints = computed<AnalyticsPriceTrendPoint[]>(() => {
    if (!rangeWindow.value) {
      return []
    }

    const intervals = buildIntervals(rangeWindow.value, selectedRange.value)
    const grouped = new Map<string, { total: bigint, count: number }>(
      intervals.map(point => [rangeBucketKey(point, selectedRange.value), { total: BigInt(0), count: 0 }]),
    )

    salesInRange.value.forEach((event) => {
      const eventDate = parseISO(event.timestamp)
      if (Number.isNaN(eventDate.getTime())) {
        return
      }

      const key = rangeBucketKey(eventDate, selectedRange.value)
      const current = grouped.get(key)
      const eventPrice = toBigInt(event.price)

      if (!current) {
        return
      }

      current.total += eventPrice
      current.count += 1
    })

    return intervals.map((point) => {
      const key = rangeBucketKey(point, selectedRange.value)
      const value = grouped.get(key)
      const avgRaw = value && value.count > 0
        ? (value.total / BigInt(value.count)).toString()
        : null

      return {
        dateKey: key,
        label: rangeLabel(point, selectedRange.value),
        price: avgRaw === null
          ? null
          : toChartAmount(avgRaw, decimals.value),
      }
    })
  })

  const listingFloorTrendPoints = computed<AnalyticsPriceTrendPoint[]>(() => {
    if (!rangeWindow.value) {
      return []
    }

    const intervals = buildIntervals(rangeWindow.value, selectedRange.value)
    const activeListings = new Map<string, bigint>()
    let eventIndex = 0

    function applyMarketEvent(event: AnalyticsMarketEventRow): void {
      if (!event.nftId) {
        return
      }

      if (event.interaction === 'LIST') {
        const listingPrice = toBigInt(event.price)
        if (listingPrice > BigInt(0)) {
          activeListings.set(event.nftId, listingPrice)
        }
        return
      }

      if (event.interaction === 'UNLIST' || event.interaction === 'BUY') {
        activeListings.delete(event.nftId)
      }
    }

    function minListingPrice(): bigint | null {
      if (!activeListings.size) {
        return null
      }

      let min: bigint | null = null
      activeListings.forEach((value) => {
        if (min === null || value < min) {
          min = value
        }
      })

      return min
    }

    return intervals.map((point) => {
      const intervalEnd = isHourlyRange(selectedRange.value) ? endOfHour(point) : endOfDay(point)

      while (eventIndex < marketEventsRows.value.length) {
        const event = marketEventsRows.value[eventIndex]
        if (!event) {
          break
        }

        const eventDate = parseISO(event.timestamp)
        if (Number.isNaN(eventDate.getTime())) {
          eventIndex += 1
          continue
        }

        if (eventDate > intervalEnd) {
          break
        }

        applyMarketEvent(event)
        eventIndex += 1
      }

      const floorRaw = minListingPrice()

      return {
        dateKey: rangeBucketKey(point, selectedRange.value),
        label: rangeLabel(point, selectedRange.value),
        price: floorRaw === null ? null : toChartAmount(floorRaw.toString(), decimals.value),
      }
    })
  })

  const salePricePoints = computed<AnalyticsSalePricePoint[]>(() => {
    return salesInRange.value
      .map((event) => {
        const eventDate = parseISO(event.timestamp)
        if (Number.isNaN(eventDate.getTime())) {
          return null
        }

        return {
          eventId: event.id,
          dateKey: rangeBucketKey(eventDate, selectedRange.value),
          label: rangeLabel(eventDate, selectedRange.value),
          timestamp: event.timestamp,
          nft: {
            id: event.nftId,
            name: event.nftName,
            image: event.nftImage,
          },
          price: toChartAmount(event.price, decimals.value),
        }
      })
      .filter(Boolean) as AnalyticsSalePricePoint[]
  })

  const listingPoints = computed<AnalyticsListingPoint[]>(() => {
    return marketEventsInRange.value
      .filter(event => event.interaction === 'LIST' && toBigInt(event.price) > BigInt(0))
      .map((event) => {
        const eventDate = parseISO(event.timestamp)
        if (Number.isNaN(eventDate.getTime())) {
          return null
        }

        return {
          eventId: event.id,
          dateKey: rangeBucketKey(eventDate, selectedRange.value),
          label: rangeLabel(eventDate, selectedRange.value),
          timestamp: event.timestamp,
          nft: {
            id: event.nftId,
            name: event.nftName,
            image: event.nftImage,
          },
          price: toChartAmount(event.price, decimals.value),
        }
      })
      .filter(Boolean) as AnalyticsListingPoint[]
  })

  const kpis = computed<AnalyticsKpis>(() => ({
    currentFloor: unref(options.floorPrice) ?? null,
    saleFloor: saleFloor.value,
    volume: rangeVolume.value.toString(),
    sales: salesInRange.value.length,
    owners: unref(options.ownersCount) ?? null,
  }))

  const volumeMiniSeries = computed<AnalyticsMiniSeriesPoint[]>(() => {
    return trendPoints.value.map(point => ({
      label: point.label,
      value: point.volume,
    }))
  })

  const floorPriceMiniSeries = computed<AnalyticsMiniSeriesPoint[]>(() => {
    return listingFloorTrendPoints.value.map(point => ({
      label: point.label,
      value: point.price,
    }))
  })

  const loading = computed(() => salesLoading.value || !salesResolved.value)

  function exportAnalytics(): void {
    void exportAnalyticsBundle()
  }

  async function exportAnalyticsBundle(): Promise<void> {
    if (!import.meta.client) {
      return
    }

    const range = selectedRange.value
    const decimalsValue = decimals.value
    const collectionNameValue = unref(options.collectionName) || ''
    const name = slugifyCollectionName(collectionNameValue)
    const generatedAt = new Date()
    const generatedAtIso = generatedAt.toISOString()
    const generatedAtStamp = format(generatedAt, 'yyyyMMdd-HHmmss')
    const bundleFilename = `${name}-analytics-${range}-${generatedAtStamp}.zip`
    const fallbackFilename = `${name}-analytics-${range}-${generatedAtStamp}-kpis.csv`

    const kpisRows: Array<Array<string | number | null | undefined>> = [
      [
        'range',
        'current_floor_raw',
        'current_floor_display',
        'sale_floor_raw',
        'sale_floor_display',
        'volume_raw',
        'volume_display',
        'sales_count',
        'owners_count',
        'generated_at',
      ],
      [
        range,
        kpis.value.currentFloor ?? '',
        formatRawAmountForExport(kpis.value.currentFloor, decimalsValue),
        kpis.value.saleFloor ?? '',
        formatRawAmountForExport(kpis.value.saleFloor, decimalsValue),
        kpis.value.volume,
        formatRawAmountForExport(kpis.value.volume, decimalsValue),
        kpis.value.sales,
        kpis.value.owners ?? '',
        generatedAtIso,
      ],
    ]

    const trendVolumeSalesRows: Array<Array<string | number | null | undefined>> = [
      ['date_key', 'label', 'volume_display', 'sales_count'],
      ...trendPoints.value.map(point => [
        point.dateKey,
        point.label,
        formatDisplayNumber(point.volume, 6),
        point.sales,
      ]),
    ]

    const trendAvgSalePriceRows: Array<Array<string | number | null | undefined>> = [
      ['date_key', 'label', 'avg_sale_price_display'],
      ...averageSalePriceTrendPoints.value.map(point => [
        point.dateKey,
        point.label,
        point.price === null ? '-' : formatDisplayNumber(point.price, 6),
      ]),
    ]

    const trendListingFloorRows: Array<Array<string | number | null | undefined>> = [
      ['date_key', 'label', 'listing_floor_display'],
      ...listingFloorTrendPoints.value.map(point => [
        point.dateKey,
        point.label,
        point.price === null ? '-' : formatDisplayNumber(point.price, 6),
      ]),
    ]

    const marketEventsRowsForCsv: Array<Array<string | number | null | undefined>> = [
      ['event_id', 'interaction', 'timestamp', 'date_key', 'price_raw', 'price_display', 'nft_id', 'nft_name', 'nft_image', 'caller'],
      ...marketEventsInRange.value.map((event) => {
        const eventDate = parseISO(event.timestamp)
        return [
          event.id,
          event.interaction,
          event.timestamp,
          Number.isNaN(eventDate.getTime()) ? '' : rangeBucketKey(eventDate, range),
          event.price,
          formatRawAmountForExport(event.price, decimalsValue),
          event.nftId,
          event.nftName || '',
          event.nftImage || '',
          event.caller || '',
        ]
      }),
    ]

    const salesRowsForCsv: Array<Array<string | number | null | undefined>> = [
      ['event_id', 'timestamp', 'date_key', 'price_raw', 'price_display', 'nft_id', 'nft_name', 'nft_image', 'caller'],
      ...salesInRange.value.map((event) => {
        const eventDate = parseISO(event.timestamp)
        return [
          event.id,
          event.timestamp,
          Number.isNaN(eventDate.getTime()) ? '' : rangeBucketKey(eventDate, range),
          event.price,
          formatRawAmountForExport(event.price, decimalsValue),
          event.nftId,
          event.nftName || '',
          event.nftImage || '',
          event.caller || '',
        ]
      }),
    ]

    const files: AnalyticsExportFile[] = [
      { name: 'kpis.csv', content: toCsv(kpisRows) },
      { name: 'trend_volume_sales.csv', content: toCsv(trendVolumeSalesRows) },
      { name: 'trend_avg_sale_price.csv', content: toCsv(trendAvgSalePriceRows) },
      { name: 'trend_listing_floor.csv', content: toCsv(trendListingFloorRows) },
      { name: 'market_events.csv', content: toCsv(marketEventsRowsForCsv) },
      { name: 'sales.csv', content: toCsv(salesRowsForCsv) },
    ]

    try {
      await downloadZipBundle(files, bundleFilename)
    }
    catch (error) {
      console.error('Failed to export analytics ZIP bundle:', error)
      downloadCsv(toCsv(kpisRows), fallbackFilename)
    }
  }

  return {
    allRangeCapped,
    exportAnalytics,
    kpis,
    loading,
    averageSalePriceTrendPoints,
    listingFloorTrendPoints,
    listingPoints,
    floorPriceMiniSeries,
    salePricePoints,
    salesError,
    salesLoading,
    trendPoints,
    volumeMiniSeries,
  }
}
