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

export function toNative(value: number, decimals: number): number {
  return Math.trunc(value * 10 ** decimals)
}
