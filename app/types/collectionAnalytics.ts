export type AnalyticsRange = '1h' | '1d' | '7d' | '30d' | '1y' | 'all'
export type AnalyticsExportKind = 'zip_bundle'

export interface AnalyticsKpis {
  currentFloor: number | string | null
  saleFloor: string | null
  volume: string
  sales: number
  owners: number | null
}

export interface AnalyticsTrendPoint {
  dateKey: string
  label: string
  volume: number
  sales: number
}

export interface AnalyticsPriceTrendPoint {
  dateKey: string
  label: string
  price: number | null
}

export interface AnalyticsMiniSeriesPoint {
  label: string
  value: number | null
}

export interface AnalyticsTopCardSeries {
  volume: AnalyticsMiniSeriesPoint[]
  floorPrice: AnalyticsMiniSeriesPoint[]
}

export interface AnalyticsSalePricePoint {
  eventId: string
  dateKey: string
  label: string
  timestamp: string
  nft: {
    id: string
    name: string | null
    image: string | null
  }
  price: number
}

export interface AnalyticsListingPoint {
  eventId: string
  dateKey: string
  label: string
  timestamp: string
  nft: {
    id: string
    name: string | null
    image: string | null
  }
  price: number
}
