import type { Entry } from './common'
import { isValidEntry } from './common'

export function parseJson(jsonData: string): Record<string, Entry> {
  try {
    const data = JSON.parse(jsonData)

    if (!Array.isArray(data)) {
      throw new TypeError('Invalid JSON file structure. Data should be an array.')
    }

    const entries: Record<string, Entry> = {}

    data.forEach((item) => {
      const entry: Partial<Entry> = {
        file: item.file || undefined,
        name: item.name || undefined,
        description: item.description || undefined,
        price: item.price !== undefined ? Number.parseFloat(item.price) : undefined,
        attributes: item.attributes,
      }

      if (!entry.file) {
        console.error(`Invalid item in JSON file: ${JSON.stringify(item)}`)
        entries[item.file] = {
          ...entry,
          file: '',
          valid: false,
        }
        return
      }
      const valid = isValidEntry(entry)
      entries[item.file] = {
        ...(entry as Entry),
        valid,
      }
    })

    return entries
  }
  catch (error) {
    console.error(`Error parsing JSON file: ${error}`)
    return {}
  }
}
