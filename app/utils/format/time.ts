import { formatDistanceToNowStrict } from 'date-fns'

export function formatToNow(date: string | number | Date, addSuffix = true): string {
  if (!import.meta.client) {
    return ''
  }

  return formatDistanceToNowStrict(new Date(date), { addSuffix })
}
