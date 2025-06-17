import {
  addSeconds,
  formatDistanceToNow as dfnsFormatDistanceToNow,
  formatDistanceToNowStrict,
  isWithinInterval,
  subDays,
} from 'date-fns'
import { enUS } from 'date-fns/locale'

export function parseDate(ts: number | Date): string {
  return new Date(ts).toLocaleString()
}

export function isDateWithinLastDays(date: Date, days: number) {
  return isWithinInterval(date, {
    start: subDays(new Date(), days),
    end: new Date(),
  })
}

export function formatDistanceToNow(date: Date) {
  return dfnsFormatDistanceToNow(date, {
    addSuffix: false,
    locale: {
      ...enUS,
      formatDistance: (token, count) => {
        const formats = {
          xSeconds: (count: number) => `${count}s`,
          xMinutes: (count: number) => `${count}m`,
          xHours: (count: number) => `${count}h`,
          xDays: (count: number) => `${count}d`,
          lessThanXSeconds: (count: number) => `<${count}s`,
          lessThanXMinutes: (count: number) => `<${count}m`,
          aboutXHours: (count: number) => `${count}h`,
        }

        return formats[token as keyof typeof formats](count)
      },
    },
  })
}

export function endDate(seconds: number): string {
  return parseDate(addSeconds(new Date(), seconds))
}

export function formatToNow(date: string | number | Date, addSuffix = true): string {
  if (!import.meta.client) {
    return ''
  }

  return formatDistanceToNowStrict(new Date(date), { addSuffix })
}
