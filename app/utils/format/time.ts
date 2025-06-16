import {
  addSeconds,
  formatDistanceToNow as dfnsFormatDistanceToNow,
  formatDistanceToNowStrict,
  formatDuration,
  intervalToDuration,
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

export function formatSecondsToDuration(seconds: number) {
  const duration = intervalToDuration({
    start: new Date(),
    end: addSeconds(new Date(), seconds),
  })
  let format
  if (Number(duration.years) > 0) {
    format = ['years']
  }
  else if (Number(duration.months) > 0) {
    format = ['months']
  }
  else if (Number(duration.days) > 0) {
    format = ['days']
  }
  else if (Number(duration.hours) > 0) {
    format = ['hours']
  }
  else if (Number(duration.minutes) > 0) {
    format = ['minutes']
  }
  else {
    format = ['seconds']
  }

  return formatDuration(duration, {
    format,
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
