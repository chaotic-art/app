import { formatDistanceToNowStrict, formatDuration, intervalToDuration } from 'date-fns'

export function formatToNow(date: string | number | Date, addSuffix = true): string {
  return formatDistanceToNowStrict(new Date(date), { addSuffix })
}

export function formatDetailedTimeToNow(date: string | number | Date): string {
  const targetDate = new Date(date)
  const now = new Date()
  const isPast = targetDate.getTime() < now.getTime()

  const duration = intervalToDuration({
    start: isPast ? targetDate : now,
    end: isPast ? now : targetDate,
  })

  const formattedDuration = formatDuration(duration, {
    format: ['days', 'hours', 'minutes'],
  })

  return formattedDuration ? (isPast ? `${formattedDuration} ago` : `in ${formattedDuration}`) : 'now'
}
