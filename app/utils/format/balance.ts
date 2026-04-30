import type { Chain } from '@/types'
import { formatBalance } from 'dedot/utils'
import { chainToPrecisionMap } from '@/utils/chain'

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

export function formatAmountWithRound(value: string | number | bigint, tokenDecimals: number, roundBy?: number | Chain) {
  let round: number | undefined
  let roundByChain = false

  if (typeof roundBy === 'string') {
    const chain = roundBy
    if (chain && isEvmChain(chain)) {
      roundByChain = true
      round = chainToPrecisionMap[chain]
    }
  }
  else {
    round = roundBy
  }

  return roundAmount(
    formatBalance(checkInvalidBalanceFilter(Number(value)), { decimals: tokenDecimals, withAll: true }),
    round === 0 ? round : round || 4,
    roundByChain ? false : round === undefined,
  )
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
