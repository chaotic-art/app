import type { MassMintFile } from '~/components/massmint/types'

export function useTemplateGenerator() {
  /**
   * Escapes a CSV field value according to RFC 4180 and prevents CSV injection
   * - Doubles internal quotes
   * - Wraps result in quotes
   * - Prevents formula injection by prefixing dangerous characters with single quote
   */
  function escapeCsvField(value: string): string {
    if (!value)
      return '""'

    let escaped = value
    // Prevent CSV formula injection by prefixing values starting with =, +, -, or @
    if (/^[=+\-@]/.test(escaped)) {
      escaped = `'${escaped}`
    }
    // Escape double quotes by doubling them
    escaped = escaped.replace(/"/g, '""')
    // Always wrap in quotes
    return `"${escaped}"`
  }

  function generateCsvTemplate(files: MassMintFile[]): string {
    const header = 'filename,name,description,price'
    const rows = files.map(f =>
      [
        escapeCsvField(f.file.name),
        escapeCsvField(f.name || ''),
        escapeCsvField(f.description || ''),
        escapeCsvField(''),
      ].join(','),
    )
    return [header, ...rows].join('\n')
  }

  function downloadCsvTemplate(files: MassMintFile[], collectionName?: string) {
    const csv = generateCsvTemplate(files)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${collectionName || 'massmint'}_template.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    generateCsvTemplate,
    downloadCsvTemplate,
  }
}
