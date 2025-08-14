import type { Prefix } from '@kodadot1/static'
import type BN from 'bn.js'
import { formatBalance } from '@polkadot/util'
import { chainToPrecisionMap, prefixToChainMap } from '@/types'

function format(
  balance: number | string | BN | bigint,
  decimals = 12,
  withUnit?: boolean | string,
  withSi?: boolean,
) {
  try {
    const fixedBalance
      = typeof balance === 'number' ? balance.toFixed() : balance

    return formatBalance(fixedBalance, {
      decimals,
      withUnit,
      forceUnit: '-',
      withSi,
    })
  }
  catch {
    return ''
  }
}

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
    format(checkInvalidBalanceFilter(Number(value)), tokenDecimals, ''),
    round === 0 ? round : round || 4,
    roundByPrefix ? false : round === undefined,
  )
}

export function toNative(value: number, decimals: number): number {
  return Math.trunc(value * 10 ** decimals)
}

export default format
