import type { ZipEntry } from 'unzipit'
import { mimeTypes } from '@kodadot1/static'
import { unzip } from 'unzipit'
import { ref } from 'vue'

export interface FileObject {
  imageUrl: string
  file: File
}

export interface WarningObject {
  name: string
  reason: string
}

export interface ValidityResult {
  validFiles: FileObject[]
  totalFiles: number
  warnings: WarningObject[]
}

export const validFormats = [
  'bmp',
  'gif',
  'jpg',
  'jpeg',
  'png',
  'svg',
  'tiff',
  'webp',
  'mp4',
  'ogv',
  'mov',
  'qt',
  'webm',
  'glb',
  'gltf',
  'flac',
  'mp3',
  'json',
  'avif',
]

const toMegaBytes = (bytes: number) => bytes / 1024 ** 2

function isFileSizeTooLarge(size: number): boolean {
  return toMegaBytes(size) > 512
}

function getFileExtension(name: string): string {
  const lastDotIndex = name.lastIndexOf('.')
  return lastDotIndex !== -1
    ? name.substring(lastDotIndex + 1).toLowerCase()
    : ''
}

const isMacOsHiddenFile = (name: string): boolean => name.startsWith('__MACOSX')

function isValidFileExtension(extension: string): boolean {
  return validFormats.includes(extension)
}

async function checkZipFileValidity(entries: {
  [key: string]: ZipEntry
}): Promise<ValidityResult> {
  const validFiles: FileObject[] = []
  const warnings: WarningObject[] = []

  for (const [name, entry] of Object.entries(entries)) {
    let isEntryValid = true
    if (isMacOsHiddenFile(name)) {
      isEntryValid = false
    }

    if (isEntryValid && entry.isDirectory) {
      warnings.push({
        name,
        reason: 'is a directory',
      })
      isEntryValid = false
    }

    if (isEntryValid && isFileSizeTooLarge(entry.size)) {
      warnings.push({
        name,
        reason: 'File size exceeds maximum limit',
      })
      isEntryValid = false
    }

    const fileExtension = getFileExtension(name)
    if (isEntryValid && !isValidFileExtension(fileExtension)) {
      warnings.push({
        name,
        reason: `Invalid file format (${fileExtension})`,
      })
      isEntryValid = false
    }

    if (isEntryValid) {
      const blob = await entry.blob(mimeTypes[fileExtension])
      const file: FileObject = {
        imageUrl: URL.createObjectURL(blob),
        file: new File([blob], name, { type: blob.type }),
      }
      validFiles.push(file)
    }
  }

  return {
    validFiles,
    totalFiles: Object.keys(entries).length,
    warnings,
  }
}

export function useZipFileValidator(zipFilePath: string) {
  const validFiles = ref<FileObject[]>([])
  const warnings = ref<WarningObject[]>([])
  const loading = ref<boolean>(true)
  const totalFiles = ref<number>(0)
  const allValid = ref<boolean>(false)

  const processZipFile = async () => {
    const { entries } = await unzip(zipFilePath)
    const {
      validFiles: validFilesValue,
      warnings: warningsValue,
      totalFiles: totalFilesValue,
    } = await checkZipFileValidity(entries)
    validFiles.value = validFilesValue
    warnings.value = warningsValue
    totalFiles.value = totalFilesValue
    loading.value = false
    allValid.value = validFilesValue.length === totalFilesValue
  }

  processZipFile().catch((error) => {
    console.error('Error processing zip file:', error)
  })

  return { validFiles, warnings, loading, totalFiles, allValid }
}
