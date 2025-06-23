export function formatCETDate(date: string, time: string): Date {
  return new Date(`${date}T${time}+02:00`)
}

export function parseCETDate(datetime: string): Date {
  const [date, time] = datetime.split(' ')
  return formatCETDate(date!, time!)
}
