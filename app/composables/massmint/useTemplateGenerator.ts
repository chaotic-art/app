import type { MassMintFile } from '~/components/massmint/types'

export function useTemplateGenerator() {
  function generateCsvTemplate(files: MassMintFile[]): string {
    const header = 'filename,name,description,price'
    const rows = files.map(f => `"${f.file.name}","${f.name || ''}","${f.description || ''}",""`)
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
