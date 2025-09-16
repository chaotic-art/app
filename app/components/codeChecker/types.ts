interface Success<T> {
  isSuccess: true
  value: T
}

interface Failure {
  isSuccess: false
  error: string
}

export type Passed = boolean | 'loading' | 'unknown'

export type Result<T> = Success<T> | Failure

export interface Validity {
  canvasSize: string
  title: string
  localP5jsUsed: boolean
  kodaRendererUsed: Passed
  kodaRendererCalledOnce: Passed
  resizerUsed: Passed
  externalResourcesNotUsed: Passed
  usesHashParam: Passed
  validTitle: Passed
  renderDurationValid: Passed
  validKodaRenderPayload: Passed
  // same hash should create same art, otherwise this will be false
  consistent: Passed
}

export type AssetType = 'script' | 'style'

export interface AssetMessage {
  type: AssetType
  parent: 'head' | 'body'
  src: string
  originalSrc: string
}

export interface PreviewItem {
  hash: string
  loading: boolean
}

export type CapturePreviewItem = {
  image?: string
  startedAt?: number
  renderedAt?: number
} & PreviewItem

export type CanvasPreviewItem = {
  startedAt: number
  renderedAt?: number
} & PreviewItem
