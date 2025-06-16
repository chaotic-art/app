import type { Interaction } from '@/types'
import { formatISO, subDays } from 'date-fns'
import { after, between, getVolume } from '@/utils/math'

export interface SortType {
  field: string
  value: 'ASC' | 'DESC'
}

export const today = new Date()
export const yesterdayDate: Date = subDays(today, 1)
export const lastweekDate: Date = subDays(today, 7)
export const lastmonthDate: Date = subDays(today, 30)
export const last3monthDate: Date = subDays(today, 90)
export const sub2dayDate: Date = subDays(today, 2)
export const last2weekDate: Date = subDays(today, 14)
export const last2monthDate: Date = subDays(today, 60)
export const last6monthDate: Date = subDays(today, 60)
export const volume = (buyEvents: Interaction[]) => Number(getVolume(buyEvents))

export function weeklyVolume(buyEvents: Interaction[]) {
  return Number(getVolume(buyEvents.filter(after(lastweekDate))))
}

export function monthlyVolume(buyEvents: Interaction[]) {
  return Number(getVolume(buyEvents.filter(after(lastmonthDate))))
}

export function threeMonthlyVolume(buyEvents: Interaction[]) {
  return Number(getVolume(buyEvents.filter(after(last3monthDate))))
}

export function dailyrangeVolume(buyEvents: Interaction[]) {
  return Number(getVolume(buyEvents.filter(between(sub2dayDate, yesterdayDate))))
}

export function weeklyrangeVolume(buyEvents: Interaction[]) {
  return Number(getVolume(buyEvents.filter(between(last2weekDate, lastweekDate))))
}

export function monthlyrangeVolume(buyEvents: Interaction[]) {
  return Number(getVolume(buyEvents.filter(between(last2monthDate, lastmonthDate))))
}

export function threeMonthRangeVolume(buyEvents: Interaction[]) {
  return Number(getVolume(buyEvents.filter(between(last6monthDate, last3monthDate))))
}

export function onlyDate(datetime: Date) {
  return formatISO(datetime, { representation: 'date' })
}

export function toSort(sortBy: SortType): string {
  return `${sortBy.field}_${sortBy.value}`
}

export function calculateAvgPrice(volume: string, buys: number): string {
  return String(Math.round(Number.parseInt(volume) / buys))
}
