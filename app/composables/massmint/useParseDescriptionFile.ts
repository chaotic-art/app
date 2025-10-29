import type { Entry } from './parsers/common'
import { parseCsv } from './parsers/parseCsv'
import { parseJson } from './parsers/parseJson'
import { parseTxt } from './parsers/parseTxt'

export function readTextFile(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      }
      else {
        reject(new Error('Unable to read file'))
      }
    }
    reader.onerror = () => {
      reject(new Error('Unable to read file'))
    }
    reader.readAsText(file)
  })
}

async function readFileAndExtractEntries(file: File): Promise<{ [key: string]: Entry } | undefined> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension) {
    console.warn(`Skipping file ${file.name}: Invalid extension`)
    return undefined
  }
  const fileContents = await readTextFile(file)

  let entries: Record<string, Entry> | undefined
  switch (extension) {
    case 'txt':
      entries = parseTxt(fileContents)
      break
    case 'csv':
      entries = parseCsv(fileContents)
      break
    case 'json':
      entries = parseJson(fileContents)
      break
    default:
      console.warn(`Skipping file ${file.name}: Invalid extension`)
      return undefined
  }

  return entries
}

export function useParseDescriptionFile(file: File) {
  const entries = ref<{ [key: string]: Entry } | undefined>(undefined)
  const loading = ref<boolean>(false)
  const error = ref<Error | undefined>(undefined)

  const parseDescriptionFile = async (file: File) => {
    loading.value = true
    entries.value = await readFileAndExtractEntries(file)
    loading.value = false
  }

  parseDescriptionFile(file).catch((e) => {
    console.error('Error parsing description file', e)
    error.value = e as Error
    loading.value = false
  })

  return {
    entries,
    loading,
    error,
  }
}
