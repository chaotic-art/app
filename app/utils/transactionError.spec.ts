import { InvalidTxError } from 'polkadot-api'
import { describe, expect, it } from 'vitest'
import { resolveTransactionError } from './transactionError'

describe('resolveTransactionError', () => {
  it('returns already-normalized transaction errors', () => {
    expect(resolveTransactionError({ kind: 'dispatch_error', details: 'bad origin' })).toEqual({
      kind: 'dispatch_error',
      details: 'bad origin',
    })
  })

  it('normalizes details to string for already-normalized kind', () => {
    expect(resolveTransactionError({ kind: 'unknown' })).toEqual({
      kind: 'unknown',
      details: '',
    })

    expect(resolveTransactionError({ kind: 'cancelled', details: { reason: 'user' } })).toEqual({
      kind: 'cancelled',
      details: '{"reason":"user"}',
    })
  })

  it('maps wallet rejection errors by EIP-1193 4001 code', () => {
    expect(resolveTransactionError({
      code: 4001,
      message: 'User rejected the request.',
    })).toEqual({
      kind: 'cancelled',
      details: '',
    })

    expect(resolveTransactionError({
      cause: {
        code: '4001',
        message: 'User rejected the request.',
      },
    })).toEqual({
      kind: 'cancelled',
      details: '',
    })
  })

  it('maps cancellation by AbortError fields and Cancelled message', () => {
    expect(resolveTransactionError({
      originalError: {
        name: 'AbortError',
        message: 'The operation was aborted.',
      },
    })).toEqual({
      kind: 'cancelled',
      details: '',
    })

    expect(resolveTransactionError({
      data: {
        type: 'abort',
      },
    })).toEqual({
      kind: 'cancelled',
      details: '',
    })

    expect(resolveTransactionError(new Error('Cancelled'))).toEqual({
      kind: 'cancelled',
      details: '',
    })
  })

  it('maps tx-event token payloads to insufficient_funds', () => {
    expect(resolveTransactionError({
      type: 'Token',
      value: {
        type: 'FundsUnavailable',
      },
    })).toEqual({
      kind: 'insufficient_funds',
      details: '',
    })
  })

  it('maps runtime payment payloads to insufficient_funds', () => {
    expect(resolveTransactionError({
      type: 'Payment',
    })).toEqual({
      kind: 'insufficient_funds',
      details: '',
    })
  })

  it('maps runtime BadOrigin payload to dispatch_error', () => {
    expect(resolveTransactionError({
      type: 'BadOrigin',
    })).toEqual({
      kind: 'dispatch_error',
      details: '{"type":"BadOrigin"}',
    })
  })

  it('maps InvalidTxError payloads from polkadot-api', () => {
    expect(resolveTransactionError(new InvalidTxError({
      type: 'Token',
      value: {
        type: 'FundsUnavailable',
      },
    }))).toEqual({
      kind: 'insufficient_funds',
      details: '',
    })

    expect(resolveTransactionError(new InvalidTxError({
      type: 'Invalid',
      value: {
        type: 'Payment',
      },
    }))).toEqual({
      kind: 'insufficient_funds',
      details: '',
    })

    expect(resolveTransactionError(new InvalidTxError({ type: 'BadOrigin' }))).toEqual({
      kind: 'dispatch_error',
      details: '{"type":"BadOrigin"}',
    })
  })

  it('falls back to unknown for non-runtime payloads', () => {
    expect(resolveTransactionError(new Error('boom'))).toEqual({
      kind: 'unknown',
      details: 'boom',
    })

    expect(resolveTransactionError({ foo: 'bar' })).toEqual({
      kind: 'unknown',
      details: '{"foo":"bar"}',
    })
  })
})
