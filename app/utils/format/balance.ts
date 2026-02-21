import type { Prefix } from '@kodadot1/static'
import { formatBalance } from 'dedot/utils'
import { chainToPrecisionMap, prefixToChainMap } from '@/types'

export function checkInvalidBalanceFilter(value: number) {
  if (value === Infinity) {
    return '0'
  }
  return value
}

export function roundTo(value: number | string, limit = 2) {
  const number = Number(value.toString().replace(/,/g, ''))
  const hasDecimals = number % 1 !== 0
  const fractionDigits = hasDecimals ? limit : 0
  return number.toLocaleString(undefined, {
    maximumFractionDigits: fractionDigits,
  })
}

function roundAmount(value: string, limit?: number, disableFilter?: boolean) {
  const number = Number(value.replace(/,/g, ''))

  return disableFilter
    ? Number.parseFloat(number.toString()).toLocaleString()
    : roundTo(value, limit)
}

export function formatAmountWithRound(value: string | number | bigint, tokenDecimals: number, roundBy?: number | Prefix) {
  let round: number | undefined
  let roundByPrefix = false

  if (typeof roundBy === 'string') {
    const prefix = roundBy as Prefix
    if (prefix && isEvm(prefix)) {
      roundByPrefix = true
      round = chainToPrecisionMap[prefixToChainMap[prefix]]
    }
  }
  else {
    round = roundBy
  }

  return roundAmount(
    formatBalance(checkInvalidBalanceFilter(Number(value)), { decimals: tokenDecimals, withAll: true }),
    round === 0 ? round : round || 4,
    roundByPrefix ? false : round === undefined,
  )
}

export function formatRawAmount(raw: string | number | null | undefined, decimals: number, fractionDigits = 4): string {
  if (raw === null || raw === undefined) {
    return '-'
  }

  const normalized = String(raw).trim()
  if (!normalized) {
    return '-'
  }

  const isIntegerLike = /^-?\d+$/.test(normalized)
  if (!isIntegerLike) {
    const parsed = Number(normalized)
    if (!Number.isFinite(parsed)) {
      return '-'
    }

    return parsed.toFixed(fractionDigits).replace(/\.?0+$/g, '')
  }

  const negative = normalized.startsWith('-')
  const digits = negative ? normalized.slice(1) : normalized

  if (!digits) {
    return '0'
  }

  const safeDecimals = Math.max(0, decimals)
  const padded = digits.padStart(safeDecimals + 1, '0')
  const integerPart = padded.slice(0, -safeDecimals) || '0'
  const fraction = safeDecimals > 0
    ? padded.slice(-safeDecimals).slice(0, fractionDigits).replace(/0+$/g, '')
    : ''

  return `${negative ? '-' : ''}${integerPart}${fraction ? `.${fraction}` : ''}`
}

export function formatDisplayNumber(value: number | null | undefined, fractionDigits = 6): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-'
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: fractionDigits,
  })
}

export function toNative(value: number, decimals: number): number {
  return Math.trunc(value * 10 ** decimals)
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`
  }
  return value.toString()
}
