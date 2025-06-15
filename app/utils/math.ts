import type { Interaction } from '@/types'
import { isAfter, isBefore, isEqual, parseISO } from 'date-fns'

export function sum(array: number[]): number {
  return array.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
}

export function getSumOfObjectField<T>(
  list: Array<T>,
  field: keyof T,
): bigint | number {
  return list
    .map(x => Number(x[field]))
    .map(x => BigInt(x || 0))
    .reduce((acc, cur) => acc + cur, BigInt(0))
}

export function getNumberSumOfObjectField<T>(
  list: Array<T>,
  field: keyof T,
): number {
  return list
    .map(x => Number(x[field]) || 0)
    .reduce((acc, cur) => acc + cur, Number(0))
}

export function getVolume(events: { meta: string }[]): bigint {
  return events
    .map(x => x.meta)
    .map(x => BigInt(x || 0))
    .reduce((acc, cur) => acc + cur, BigInt(0))
}

export function after(date: Date) {
  return (event: Interaction): boolean =>
    isAfter(parseISO(event.timestamp), date)
    || isEqual(parseISO(event.timestamp), date)
}

export function between(dateA: Date, dateB: Date) {
  return (event: Interaction): boolean =>
    (isAfter(parseISO(event.timestamp), dateA)
      || isEqual(parseISO(event.timestamp), dateA))
    && isBefore(parseISO(event.timestamp), dateB)
}

export function toDecimals(value: number, decimals: number): number {
  return value * 10 ** decimals
}

export function fromDecimals(value: number, decimals: number): number {
  return value / 10 ** decimals
}
