import type { Interaction } from '@/types'
import { isAfter, isBefore, isEqual, parseISO } from 'date-fns'

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
