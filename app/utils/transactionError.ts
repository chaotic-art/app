import type { TxEvent } from 'polkadot-api'
import { InvalidTxError } from 'polkadot-api'

interface RuntimeErrorPayload {
  type?: unknown
  value?: unknown
}

export type TransactionErrorKind = 'insufficient_funds' | 'dispatch_error' | 'cancelled' | 'unknown'

export interface TransactionError {
  kind: TransactionErrorKind
  details: string
}

const USER_REJECTED_CODES = new Set([4001, '4001'])
const ABORT_ERROR_NAME = 'aborterror'
const ABORT_ERROR_TYPE = 'abort'

function isTransactionError(value: unknown): value is TransactionError {
  return typeof value === 'object'
    && value !== null
    && 'kind' in value
    && 'details' in value
}

function isRuntimeErrorPayload(value: unknown): value is RuntimeErrorPayload {
  return typeof value === 'object' && value !== null && ('type' in value || 'value' in value)
}

function getNormalizedType(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function stringifyPayload(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  try {
    return JSON.stringify(value)
  }
  catch {
    return String(value)
  }
}

function parseJsonPayload(message: string): RuntimeErrorPayload | null {
  try {
    const parsed = JSON.parse(message)
    return isRuntimeErrorPayload(parsed) ? parsed : null
  }
  catch {
    return null
  }
}

function extractMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error as { message?: unknown }
    if (typeof message === 'string') {
      return message
    }
  }

  return stringifyPayload(error ?? '')
}

function isInvalidPaymentError(payload: RuntimeErrorPayload | null): boolean {
  if (!payload) {
    return false
  }

  const type = getNormalizedType(payload.type)
  if (type === 'payment') {
    return true
  }

  if (type !== 'invalid') {
    return false
  }

  if (typeof payload.value === 'string') {
    return getNormalizedType(payload.value) === 'payment'
  }

  if (isRuntimeErrorPayload(payload.value)) {
    return getNormalizedType(payload.value.type) === 'payment'
  }

  return false
}

function isTokenNoFundsError(payload: RuntimeErrorPayload | null): boolean {
  if (!payload) {
    return false
  }

  const type = getNormalizedType(payload.type)
  if (type !== 'token') {
    return false
  }

  if (typeof payload.value === 'string') {
    const normalized = getNormalizedType(payload.value)
    return normalized === 'nofunds' || normalized === 'fundsunavailable' || normalized === 'belowminimum'
  }

  if (isRuntimeErrorPayload(payload.value)) {
    const normalized = getNormalizedType(payload.value.type)
    return normalized === 'nofunds' || normalized === 'fundsunavailable' || normalized === 'belowminimum'
  }

  return false
}

function getRuntimePayload(error: unknown): RuntimeErrorPayload | null {
  if (error instanceof InvalidTxError && isRuntimeErrorPayload(error.error)) {
    return error.error
  }

  if (isRuntimeErrorPayload(error)) {
    return error
  }

  const message = extractMessage(error)
  if (!message) {
    return null
  }

  return parseJsonPayload(message)
}

function getErrorField(
  error: unknown,
  field: 'code' | 'name' | 'type',
  depth = 0,
): unknown {
  if (depth > 3 || typeof error !== 'object' || error === null) {
    return null
  }

  const record = error as Record<string, unknown>
  if (field in record) {
    return record[field]
  }

  const nestedKeys = ['cause', 'error', 'originalError', 'data']
  for (const key of nestedKeys) {
    const nestedValue = getErrorField(record[key], field, depth + 1)
    if (nestedValue !== null && nestedValue !== undefined) {
      return nestedValue
    }
  }

  return null
}

function isCancelledError(error: unknown): boolean {
  const code = getErrorField(error, 'code')
  if (USER_REJECTED_CODES.has(code as number | string)) {
    return true
  }

  const name = getNormalizedType(getErrorField(error, 'name'))
  if (name === ABORT_ERROR_NAME) {
    return true
  }

  const type = getNormalizedType(getErrorField(error, 'type'))
  if (type === ABORT_ERROR_TYPE) {
    return true
  }

  const message = getNormalizedType(extractMessage(error))
  if (message === 'cancelled' || message === 'canceled') {
    return true
  }

  return false
}

export function resolveTransactionError(error: unknown): TransactionError {
  if (isTransactionError(error)) {
    return error
  }
  if (isCancelledError(error)) {
    return {
      kind: 'cancelled',
      details: '',
    }
  }
  const payload = getRuntimePayload(error)

  if (isInvalidPaymentError(payload) || isTokenNoFundsError(payload)) {
    return {
      kind: 'insufficient_funds',
      details: '',
    }
  }

  if (payload) {
    return {
      kind: 'dispatch_error',
      details: stringifyPayload(payload),
    }
  }

  return {
    kind: 'unknown',
    details: extractMessage(error),
  }
}

export function getTxEventError(event: TxEvent): unknown | null {
  if (event.type === 'txBestBlocksState') {
    if (!event.found || event.ok) {
      return null
    }

    return event.dispatchError
  }

  if (event.type === 'finalized' && !event.ok) {
    return event.dispatchError
  }

  return null
}
