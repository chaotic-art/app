import type { Property } from '~/composables/onchain/useNftPallets'

const ATTRIBUTE_SEPARATOR = ';'
const EXPECTED_HEADERS = ['id', 'properties'] as const

export interface NftGraphqlTraitAttribute {
  trait?: string
  value: string
}

export function parseSnFromNftEntityId(id?: string): number {
  const parts = String(id ?? '').split('-')
  const tokenId = Number(parts.at(-1))
  return Number.isFinite(tokenId) ? tokenId : 0
}

export function normalizeNftGraphqlAttributes(attrs?: NftGraphqlTraitAttribute[]): Property[] {
  const out: Property[] = []

  ;(attrs ?? []).forEach((a) => {
    const trait = a.trait?.trim()
    const value = String(a.value ?? '').trim()
    if (!trait || !value) {
      return
    }
    out.push({ trait, value })
  })

  out.sort((a, b) => {
    if (a.trait !== b.trait) {
      return a.trait.localeCompare(b.trait)
    }
    return a.value.localeCompare(b.value)
  })

  return out
}

export function collectionTraitRowMatchesQuery(
  searchRaw: string,
  row: { sn: number, name: string, properties: Property[] },
): boolean {
  const q = searchRaw.trim().toLowerCase()
  if (!q) {
    return true
  }
  if (String(row.sn).includes(q) || row.name.toLowerCase().includes(q)) {
    return true
  }
  return row.properties.some(p => p.trait.toLowerCase().includes(q) || p.value.toLowerCase().includes(q))
}

export function bulkTraitRowMatchesQuery(
  searchRaw: string,
  row: {
    sn: number
    name: string
    properties: Property[]
    nextProperties: Property[] | null
  },
): boolean {
  const q = searchRaw.trim().toLowerCase()
  if (!q) {
    return true
  }
  if (String(row.sn).includes(q) || row.name.toLowerCase().includes(q)) {
    return true
  }
  if (row.properties.some(p => p.trait.toLowerCase().includes(q) || p.value.toLowerCase().includes(q))) {
    return true
  }
  if (row.nextProperties?.some(p => p.trait.toLowerCase().includes(q) || p.value.toLowerCase().includes(q))) {
    return true
  }
  return false
}

export function csvIdsMissingFromCollection(
  collectionNftIds: Iterable<string>,
  csvIds: Iterable<string>,
): string[] {
  const known = new Set(collectionNftIds)
  return [...csvIds].filter(id => !known.has(id))
}

export function escapeCsvCell(value: string | number): string {
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/** properties format: `trait:value;trait2:value2` */
export function parsePropertiesCell(value: string): Property[] {
  const out: Property[] = []
  const trimmed = value.trim()
  if (!trimmed) {
    return out
  }
  trimmed.split(ATTRIBUTE_SEPARATOR).forEach((attr) => {
    const idx = attr.indexOf(':')
    if (idx === -1) {
      return
    }
    const trait = attr.slice(0, idx).trim()
    const val = attr.slice(idx + 1).trim()
    if (trait && val) {
      out.push({ trait, value: val })
    }
  })
  return out
}

export function serializeProperties(props: Property[]): string {
  return props.map(p => `${p.trait}:${p.value}`).join(';')
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      }
      else {
        inQuotes = !inQuotes
      }
    }
    else if (c === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    }
    else {
      current += c
    }
  }
  result.push(current.trim())
  return result
}

export interface ParsedBulkTraitsCsv {
  byId: Map<string, Property[]>
}

export function parseBulkTraitsCsv(content: string): { ok: true, data: ParsedBulkTraitsCsv } | { ok: false, error: string } {
  const text = content.replace(/^\uFEFF/, '').trim()
  if (!text) {
    return { ok: false, error: 'The file is empty.' }
  }

  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length < 2) {
    return { ok: false, error: 'Expected a header row and at least one data row.' }
  }

  const headerCells = parseCsvLine(lines[0]!).map(h => h.trim().toLowerCase())
  if (headerCells.length < 2) {
    return { ok: false, error: 'Expected columns: id, properties' }
  }

  const idIdx = headerCells.indexOf('id')
  const propIdx = headerCells.indexOf('properties')
  if (idIdx === -1 || propIdx === -1) {
    return { ok: false, error: `Header must include: ${EXPECTED_HEADERS.join(', ')}` }
  }

  const byId = new Map<string, Property[]>()
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!)
    const id = cells[idIdx]?.trim()
    if (!id) {
      continue
    }
    const rawProps = cells[propIdx] ?? ''
    byId.set(id, parsePropertiesCell(rawProps))
  }

  return { ok: true, data: { byId } }
}

export function exportBulkTraitsCsv(
  rows: Array<{ id: string, properties: Property[] }>,
  filenameBase: string,
): void {
  const header = 'id,properties'
  const lines = [header, ...rows.map(r =>
    [escapeCsvCell(r.id), escapeCsvCell(serializeProperties(r.properties))].join(','),
  )]
  const csv = lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filenameBase}-traits-bulk.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function normalizePropertiesForCompare(props: Property[]): Property[] {
  return [...props]
    .filter(p => p.trait.trim() && p.value.trim())
    .map(p => ({ trait: p.trait.trim(), value: p.value.trim() }))
    .sort((a, b) => (a.trait !== b.trait ? a.trait.localeCompare(b.trait) : a.value.localeCompare(b.value)))
}

export function propertiesEqual(a: Property[], b: Property[]): boolean {
  const na = normalizePropertiesForCompare(a)
  const nb = normalizePropertiesForCompare(b)
  if (na.length !== nb.length) {
    return false
  }
  return na.every((p, i) => p.trait === nb[i]!.trait && p.value === nb[i]!.value)
}
