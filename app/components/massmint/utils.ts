import type { NFT } from '~/components/massmint/types'

export type TemplateFormat = 'json' | 'csv' | 'txt'

export const attributesExample = [
  { value: 'white', trait_type: 'color' },
  { value: 'happy', trait_type: 'expression' },
] as const

/**
 * Generate metadata template content for the given format and NFTs.
 */
export function generateTemplateContent(format: TemplateFormat, nfts: NFT[]): string {
  if (format === 'json') {
    const items = nfts.map((nft, index) => ({
      file: nft.file?.name || '',
      ...(index === 0
        ? { name: 'Art #1', price: 1, description: 'Description for the Art #1', attributes: [...attributesExample] }
        : { name: '', description: '', price: '', attributes: [] }
      ),
    }))
    return JSON.stringify(items, null, 2)
  }

  if (format === 'csv') {
    const csvEscape = (value: string) => {
      const escaped = value.replace(/"/g, '""')
      return /[",\n\r]/.test(value) ? `"${escaped}"` : escaped
    }
    const header = 'file,name,description,attributes,price'
    const attributesCsvExample = 'color:white;expression:happy'
    const rows = nfts.map((nft, index) => {
      const file = nft.file?.name || ''
      if (index === 0) {
        return [
          csvEscape(file),
          csvEscape('Art #1'),
          csvEscape('Description for the Art #1'),
          csvEscape(attributesCsvExample),
          csvEscape('1'),
        ].join(',')
      }
      return `${csvEscape(file)},,,,`
    })
    return [header, ...rows].join('\n')
  }

  // txt
  const attributesTxtExample = '[{"value": "white","trait_type": "color"},{"value": "happy","trait_type": "expression"}]'
  const blocks = nfts.map((nft, index) => {
    const fileName = nft.file?.name || ''
    const isFirst = index === 0
    return [
      `file: ${fileName}`,
      isFirst ? 'name: Art #1' : 'name: ',
      isFirst ? 'description: Description for the Art #1' : 'description: ',
      isFirst ? `attributes: ${attributesTxtExample}` : 'attributes: ',
      isFirst ? 'price: 1' : 'price: ',
      '',
    ].join('\n')
  })
  return blocks.join('\n')
}

export function convertNftsToMap<T extends object>(
  items: T[],
): Record<string, T & { id: number }> {
  const result: Record<string, T & { id: number }> = {}
  items.forEach((item, i) => {
    const nft = { ...item, id: i + 1 } as T & { id: number }
    result[String(nft.id)] = nft
  })
  return result
}
