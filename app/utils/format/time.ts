import { formatDistanceToNowStrict } from 'date-fns'

export function formatToNow(date: string | number | Date, addSuffix = true): string {
  return formatDistanceToNowStrict(new Date(date), { addSuffix })
}
