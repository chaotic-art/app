import { fetchMetadata, getSanitizer } from '@/utils/ipfs'
import { emptyObject } from './empty'
import { fastExtract } from './ipfs'

type P<T> = Promise<T>
type KeyValue = Record<string, string>
const metadataCache: Record<string, unknown> = {}

export async function cacheOrFetchMetadata<T>(fromCache: T | undefined, metadata: string): P<T> {
  if (fromCache && Object.keys(fromCache).length) {
    return fromCache
  }

  try {
    return await fetchMetadata<T>({ metadata })
  }
  catch (e) {
    console.warn('[ERR] unable to get metadata', e)
    return emptyObject<T>()
  }
}

export function processSingleMetadata<T>(metadata: string): P<T> {
  return cacheOrFetchMetadata<T>(metadataCache[metadata] as T | undefined, metadata)
}

export function processMetadata<T>(metadataList: string[], cb?: (meta: T, index: number) => void): void {
  const metadata = metadataList.map(meta => meta || '')

  metadata.forEach(async (m, i) => {
    const meta = await processSingleMetadata<T>(m)
    if (cb && meta !== undefined) {
      metadataCache[m] = meta as T
      cb(meta, i)
    }
  })
}

export function getProperImageLink(imageLinks: KeyValue) {
  return (metadata: string, image: string): string => {
    return (
      imageLinks[fastExtract(metadata)] || getSanitizer(image, 'image')(image)
    )
  }
}
