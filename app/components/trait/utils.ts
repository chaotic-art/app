import type { TraitValueRow } from './types'

export function escapeCsvCell(value: string | number): string {
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function exportTraitsToCsv(groupedTraits: Map<string, TraitValueRow[]>): void {
  if (groupedTraits.size === 0)
    return
  const lines: string[] = []
  const headers = ['Value', 'Count', 'Rarity']
  for (const [traitType, traits] of groupedTraits) {
    lines.push(traitType)
    lines.push(headers.join(','))
    for (const row of traits) {
      lines.push([
        escapeCsvCell(row.value),
        escapeCsvCell(row.count),
        escapeCsvCell(`${row.rarity.toFixed(1)}%`),
      ].join(','))
    }
    lines.push('')
  }
  const csv = lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'traits-export.csv'
  a.click()
  URL.revokeObjectURL(url)
}
