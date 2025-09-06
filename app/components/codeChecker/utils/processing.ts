import type { ZipEntry } from 'unzipit'
import { getCorsProxiedUrl } from '@/services/cors-proxy'
import { getObjectUrl, getUpload, uploadFile } from '@/services/playground'
import config from '../codechecker.config'

interface FileProcessingHandler {
  processInstance: (params: { content: string, entry: ZipEntry, entries: Record<string, ZipEntry> }) => Promise<string>
  findAll: (content: string) => RegExpMatchArray | null
}

const loadTableHandler: FileProcessingHandler = {
  findAll: (content: string) => content.match(/loadTable\([^)]+\)/g),
  processInstance: async ({ content, entries }) => {
    const match = content.match(/loadTable\(['"]([^'"]*)['"](.*?)\)/)

    if (!match) {
      return content
    }

    const [, fileUrl = '', params = ''] = match

    if (fileUrl.includes('http')) {
      return content
    }

    const file = entries[fileUrl] as ZipEntry

    if (!file) {
      return content
    }

    const { key } = await uploadFile({
      file: await file.blob(),
      fileName: fileUrl,
      prefix: 'codeChecker',
    })

    await exponentialBackoff(() => getUpload(key)).catch(console.warn)

    // proxy fixes issue with cors
    const url = getCorsProxiedUrl(getObjectUrl(key))

    return `loadTable("${url}"${params})`
  },
}

const fileHandlers: Record<string, FileProcessingHandler[]> = {
  [config.sketchFile]: [
    loadTableHandler,
  ],
}

async function processFileHandler({ content, entry, handler, entries }: { content: string, entry: ZipEntry, entries: Record<string, ZipEntry>, handler: FileProcessingHandler }): Promise<string> {
  const matches = handler.findAll(content)

  if (!matches)
    return content

  let updatedContent = content

  for (const match of matches) {
    const replacement = await handler.processInstance({
      entry,
      content: updatedContent,
      entries,
    })

    updatedContent = updatedContent.replace(match, replacement)
  }

  return updatedContent
}

export async function processFile({
  entry,
  mimeType,
  entries,
  fileName,
}: {
  entry: ZipEntry
  mimeType: string
  entries: Record<string, ZipEntry>
  fileName: string
}): Promise<string> {
  let content = await entry.text()

  for (const handler of fileHandlers[fileName] ?? []) {
    if (handler.findAll(content)) {
      content = await processFileHandler({ handler, content, entry, entries })
    }
  }

  return URL.createObjectURL(new Blob([content], { type: mimeType }))
}

export function hasFileProcessing(fileName: string): boolean {
  return fileHandlers[fileName] !== undefined
}
