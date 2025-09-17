<script setup lang="ts">
import { useZipFileValidator } from '~/composables/massmint/useZipValidator'

interface Props {
  disabled?: boolean
}

interface Emits {
  (e: 'zipLoaded', data: { validFiles: any[], areAllFilesValid: boolean }): void
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<Emits>()

const loading = ref(false)
const showCheckmark = ref(false)
const files = ref<File>()

watch(files, (newFiles) => {
  onFileSelected(newFiles)
})
async function onFileSelected(file?: File) {
  const zipMimeTypes = ['application/zip', 'application/x-zip-compressed']
  showCheckmark.value = false
  if (file && zipMimeTypes.includes(file.type)) {
    loading.value = true
    try {
      const stream = file.stream()
      const chunks: BlobPart[] = []
      const reader = stream.getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break
        chunks.push(value)
      }

      const blob = new Blob(chunks)
      const zipFilePath = URL.createObjectURL(blob)

      const {
        allValid,
        loading: loadingZip,
        validFiles,
        warnings,
      } = useZipFileValidator(zipFilePath)

      watch(loadingZip, (isLoading) => {
        loading.value = isLoading
        if (!isLoading) {
          if (warnings.value.length > 0) {
            const fileNames = warnings.value
              .map(({ name }) => name)
              .join(',   ')

            warningMessage(
              `${fileNames}  ${warnings.value.length} files were not uploaded`,
            )
          }
          showCheckmark.value = true
          emit('zipLoaded', {
            validFiles: validFiles.value,
            areAllFilesValid: allValid.value,
          })

          URL.revokeObjectURL(zipFilePath)
        }
      })
    }
    catch (error) {
      console.error('Error processing zip file:', error)
      loading.value = false
    }
  }
  else {
    console.error('Invalid file type.')
    emit('zipLoaded', {
      validFiles: [],
      areAllFilesValid: false,
    })
  }
}
</script>

<template>
  <div class="border-b border-border">
    <div class="p-6">
      <div class="flex items-center gap-4">
        <h3 class="text-lg font-semibold">
          Upload Arts files
        </h3>
        <UIcon
          v-if="showCheckmark"
          name="i-heroicons-check-circle"
          class="w-6 h-6 text-green-500"
        />
      </div>

      <UFileUpload
        v-model="files"
        :class="{ 'opacity-50': disabled }"
        accept=".zip"
        layout="list"
        :icon="loading ? 'i-heroicons-arrow-path' : 'i-heroicons-cloud-arrow-up'"
        label="Compress your Art files into a .ZIP file"
        description="Supported formats: BMP, GIF, JPG, JPEG, PNG, SVG, TIFF, WEBP, MP4, OGV, MOV, QT, WEBM, GLB, GLTF, FLAC, MP3, JSON, AVIF \n Drop your file here or click to select"
        color="neutral"
        size="lg"
        required
        :disabled="disabled"
      />
    </div>
  </div>
</template>
