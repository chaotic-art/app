import type { TxEvent } from 'polkadot-api'
import { InvalidTxError } from 'polkadot-api'

type TxDispatchError = Extract<TxEvent, { dispatchError: unknown }>['dispatchError']
type RuntimeErrorPayload = Omit<TxDispatchError, 'value'> & {
  value?: unknown
}

export type TransactionErrorKind = 'insufficient_funds' | 'dispatch_error' | 'cancelled' | 'unknown'

export interface TransactionError {
  kind: TransactionErrorKind
  details: string
}

const USER_REJECTED_CODES = new Set([4001, '4001'])
const ABORT_ERROR_NAME = 'AbortError'
const ABORT_ERROR_TYPE = 'abort'

function isTransactionError(value: unknown): value is TransactionError {
  return typeof value === 'object'
    && value !== null
    && 'kind' in value
    && 'details' in value
}

function isRuntimeErrorPayload(value: unknown): value is RuntimeErrorPayload {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>
  return typeof record.type === 'string'
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

  const type = payload.type
  if (type === 'Payment') {
    return true
  }

  if (type !== 'Invalid') {
    return false
  }

  if (isRuntimeErrorPayload(payload.value)) {
    return payload.value.type === 'Payment'
  }

  return false
}

function isTokenNoFundsError(payload: RuntimeErrorPayload | null): boolean {
  if (!payload) {
    return false
  }

  const type = payload.type

  if (type !== 'Token') {
    return false
  }

  if (isRuntimeErrorPayload(payload.value)) {
    return payload.value.type === 'NoFunds'
      || payload.value.type === 'FundsUnavailable'
      || payload.value.type === 'BelowMinimum'
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
  if ((typeof code === 'number' || typeof code === 'string') && USER_REJECTED_CODES.has(code)) {
    return true
  }

  const name = getErrorField(error, 'name')
  if (name === ABORT_ERROR_NAME) {
    return true
  }

  const type = getErrorField(error, 'type')
  if (type === ABORT_ERROR_TYPE) {
    return true
  }

  const message = extractMessage(error)
  if (message === 'Cancelled' || message === 'Canceled') {
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

export function getTxEventError(event: TxEvent): TxDispatchError | null {
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
