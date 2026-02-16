import type { MassMintFile } from '~/components/massmint/types'
import { validFormats } from '~/composables/massmint/useZipValidator'
import { MetadataPath } from '~/types/bulkOperations'

const MAX_FILES = 200
const MAX_FILE_SIZE_MB = 512

export function useMassMintWizard() {
  const uploadedFiles = ref<MassMintFile[]>([])
  const metadataPath = ref<MetadataPath>(MetadataPath.TEMPLATE)
  const uniformName = ref('')
  const startingNumber = ref(1)
  const sharedDescription = ref('')
  const templateUploaded = ref(false)
  const templateDownloaded = ref(false)
  const templateFileName = ref('')
  const templateFileSize = ref(0)

  const fileCount = computed(() => uploadedFiles.value.length)

  const canProceedFromUpload = computed(() => uploadedFiles.value.length > 0)

  const canProceedFromMetadata = computed(() => {
    if (metadataPath.value === MetadataPath.UNIFORM) {
      return uniformName.value.trim().length > 0
    }
    return templateUploaded.value && uploadedFiles.value.every(f => f.name && f.name.trim().length > 0)
  })

  function generateFileId(): string {
    return Math.random().toString(36).slice(2, 10)
  }

  function isValidFormat(fileName: string): boolean {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
    return validFormats.includes(ext)
  }

  function addFiles(files: File[]) {
    const remaining = MAX_FILES - uploadedFiles.value.length
    const filesToAdd = files.slice(0, remaining)

    for (const file of filesToAdd) {
      if (!isValidFormat(file.name)) {
        warningMessage(`Skipped ${file.name} — unsupported format`)
        continue
      }

      const sizeMb = file.size / (1024 * 1024)
      if (sizeMb > MAX_FILE_SIZE_MB) {
        warningMessage(`Skipped ${file.name} — exceeds ${MAX_FILE_SIZE_MB}MB limit`)
        continue
      }

      const thumbnailUrl = URL.createObjectURL(file)
      uploadedFiles.value.push({
        id: generateFileId(),
        file,
        thumbnailUrl,
        order: uploadedFiles.value.length,
        uploadStatus: 'local',
        name: file.name.replace(/\.[^.]+$/, ''),
      })
    }

    if (files.length > remaining) {
      warningMessage(`Only ${remaining} more files can be added (max ${MAX_FILES})`)
    }
  }

  function removeFile(id: string) {
    const index = uploadedFiles.value.findIndex(f => f.id === id)
    if (index !== -1) {
      const file = uploadedFiles.value[index]!
      URL.revokeObjectURL(file.thumbnailUrl)
      uploadedFiles.value.splice(index, 1)
      // Re-order remaining files
      uploadedFiles.value.forEach((f, i) => {
        f.order = i
      })
    }
  }

  function reorderFiles(oldIndex: number, newIndex: number) {
    const item = uploadedFiles.value.splice(oldIndex, 1)[0]!
    uploadedFiles.value.splice(newIndex, 0, item)
    uploadedFiles.value.forEach((f, i) => {
      f.order = i
    })
  }

  function clearFiles() {
    uploadedFiles.value.forEach(f => URL.revokeObjectURL(f.thumbnailUrl))
    uploadedFiles.value = []
  }

  function applyUniformNames() {
    uploadedFiles.value.forEach((file, index) => {
      file.name = `${uniformName.value} #${startingNumber.value + index}`
      if (sharedDescription.value) {
        file.description = sharedDescription.value
      }
    })
  }

  function applySharedDescription() {
    const trimmed = sharedDescription.value.trim()
    uploadedFiles.value.forEach((file) => {
      if (trimmed && !file.description?.trim()) {
        file.description = trimmed
      }
    })
  }

  onUnmounted(() => {
    uploadedFiles.value.forEach(f => URL.revokeObjectURL(f.thumbnailUrl))
  })

  return {
    uploadedFiles,
    metadataPath,
    uniformName,
    startingNumber,
    sharedDescription,
    templateUploaded,
    templateDownloaded,
    templateFileName,
    templateFileSize,
    fileCount,
    canProceedFromUpload,
    canProceedFromMetadata,
    addFiles,
    removeFile,
    reorderFiles,
    clearFiles,
    applyUniformNames,
    applySharedDescription,
  }
}
