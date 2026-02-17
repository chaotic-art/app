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

    // Sanitize filename: remove invalid filesystem characters
    let sanitizedName = collectionName || ''
    // biome-ignore lint/suspicious/noControlCharactersInRegex: need to strip control chars from filenames
    // eslint-disable-next-line no-control-regex
    sanitizedName = sanitizedName.replace(/[/\\?%*:|"<>\x00-\x1F]/g, '')
    if (!sanitizedName.trim()) {
      sanitizedName = 'massmint'
    }

    const link = document.createElement('a')
    link.href = url
    link.download = `${sanitizedName}_massmint_template.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Defer URL revocation to ensure download completes
    setTimeout(() => URL.revokeObjectURL(url), 500)
  }

  return {
    generateCsvTemplate,
    downloadCsvTemplate,
  }
}
