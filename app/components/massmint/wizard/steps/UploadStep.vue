<script setup lang="ts">
import type { MassMintFile } from '~/components/massmint/types'
import type { useMassMintWizard } from '~/composables/massmint/useMassMintWizard'
import draggable from 'vuedraggable'

const props = defineProps<{
  wizard: ReturnType<typeof useMassMintWizard>
}>()

const wizard = props.wizard

const isDragOver = ref(false)
const fileInputRef = ref<HTMLInputElement>()
const viewMode = ref<'grid' | 'table'>('grid')
const previewFile = ref<MassMintFile | null>(null)

const acceptedExtensions = '.bmp,.gif,.jpg,.jpeg,.png,.svg,.webp,.mp4,.ogv,.mov,.webm,.glb,.gltf,.flac,.mp3,.avif,.zip'

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  processFiles(files)
}

function handleFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  processFiles(files)
  input.value = ''
}

async function processFiles(files: File[]) {
  const zipFiles = files.filter(f => f.name.toLowerCase().endsWith('.zip'))
  const regularFiles = files.filter(f => !f.name.toLowerCase().endsWith('.zip'))

  if (regularFiles.length > 0) {
    props.wizard.addFiles(regularFiles)
  }

  for (const zip of zipFiles) {
    try {
      const { unzip } = await import('unzipit')
      const url = URL.createObjectURL(zip)
      const { entries } = await unzip(url)
      URL.revokeObjectURL(url)

      const extractedFiles: File[] = []
      for (const [name, entry] of Object.entries(entries)) {
        if (entry.isDirectory || name.startsWith('__MACOSX'))
          continue
        const blob = await entry.blob()
        extractedFiles.push(new File([blob], name.split('/').pop() || name, { type: blob.type }))
      }

      props.wizard.addFiles(extractedFiles)
    }
    catch {
      errorMessage('Failed to extract ZIP file')
    }
  }
}

function openFileDialog() {
  fileInputRef.value?.click()
}

function handleRemove(id: string) {
  props.wizard.removeFile(id)
}

function handleDragEnd() {
  props.wizard.uploadedFiles.value.forEach((f, i) => {
    f.order = i
  })
}

function openPreview(file: MassMintFile) {
  previewFile.value = file
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <!-- Drop zone -->
    <div
      class="relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer"
      :class="{
        'border-primary bg-primary/5': isDragOver,
        'border-border hover:border-primary/50': !isDragOver,
      }"
      @click="openFileDialog"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        :accept="acceptedExtensions"
        multiple
        class="hidden"
        @change="handleFileInput"
      >

      <div class="space-y-4">
        <UIcon name="i-heroicons-arrow-up-tray" class="w-12 h-12 mx-auto text-muted-foreground" />
        <div>
          <p class="text-lg font-medium">
            Drag & drop files here
          </p>
          <p class="text-sm text-muted-foreground mt-1">
            or
            <span class="text-primary underline">browse files</span>
          </p>
        </div>
        <p class="text-xs text-muted-foreground font-mono">
          Images, videos, audio, 3D models, or ZIP archives. Up to 200 files per batch.
        </p>
      </div>
    </div>

    <!-- File list -->
    <div v-if="wizard.fileCount.value > 0" class="space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">
          <span class="font-mono">{{ wizard.fileCount.value }}</span> file{{ wizard.fileCount.value !== 1 ? 's' : '' }} uploaded
          <span v-if="viewMode === 'grid'" class="text-muted-foreground font-normal">— Drag to reorder</span>
        </p>
        <div class="flex items-center gap-2">
          <!-- View toggle -->
          <div class="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              class="p-1.5 transition-colors"
              :class="viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'"
              @click="viewMode = 'grid'"
            >
              <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4" />
            </button>
            <button
              class="p-1.5 transition-colors"
              :class="viewMode === 'table' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'"
              @click="viewMode = 'table'"
            >
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4" />
            </button>
          </div>
          <UButton
            variant="ghost"
            size="sm"
            color="error"
            @click="wizard.clearFiles()"
          >
            Clear all
          </UButton>
        </div>
      </div>

      <!-- Grid view -->
      <draggable
        v-if="viewMode === 'grid'"
        v-model="wizard.uploadedFiles.value"
        item-key="id"
        class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
        ghost-class="opacity-30"
        @end="handleDragEnd"
      >
        <template #item="{ element }">
          <div
            class="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted cursor-grab active:cursor-grabbing"
            @click.stop="openPreview(element)"
          >
            <img
              v-if="element.file.type?.startsWith('image/')"
              :src="element.thumbnailUrl"
              :alt="element.file.name"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon
                :name="element.file.type?.startsWith('video/') ? 'i-heroicons-film' : element.file.type?.startsWith('audio/') ? 'i-heroicons-musical-note' : 'i-heroicons-document'"
                class="w-8 h-8 text-muted-foreground"
              />
            </div>

            <!-- Filename tooltip -->
            <div class="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5">
              <p class="text-white text-[10px] truncate font-mono">
                {{ element.file.name }}
              </p>
            </div>

            <!-- Remove button -->
            <button
              class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop="handleRemove(element.id)"
            >
              <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
            </button>

            <!-- Order number -->
            <div class="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center font-mono">
              {{ element.order + 1 }}
            </div>
          </div>
        </template>
      </draggable>

      <!-- Table view -->
      <div v-else class="border border-border rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-muted/50 border-b border-border">
              <th class="text-left py-2 px-3 font-medium text-muted-foreground w-8">
                #
              </th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground w-12" />
              <th class="text-left py-2 px-3 font-medium text-muted-foreground">
                Filename
              </th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground">
                Type
              </th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground">
                Size
              </th>
              <th class="text-right py-2 px-3 font-medium text-muted-foreground w-12" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="element in wizard.uploadedFiles.value"
              :key="element.id"
              class="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
              @click="openPreview(element)"
            >
              <td class="py-2 px-3 font-mono text-xs text-muted-foreground">
                {{ element.order + 1 }}
              </td>
              <td class="py-2 px-3">
                <div class="w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
                  <img
                    v-if="element.file.type?.startsWith('image/')"
                    :src="element.thumbnailUrl"
                    :alt="element.file.name"
                    class="w-full h-full object-cover"
                  >
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <UIcon
                      :name="element.file.type?.startsWith('video/') ? 'i-heroicons-film' : element.file.type?.startsWith('audio/') ? 'i-heroicons-musical-note' : 'i-heroicons-document'"
                      class="w-4 h-4 text-muted-foreground"
                    />
                  </div>
                </div>
              </td>
              <td class="py-2 px-3 font-mono text-xs truncate max-w-[200px]">
                {{ element.file.name }}
              </td>
              <td class="py-2 px-3 text-xs text-muted-foreground">
                {{ getFileTypeLabel(element.file.type || '') }}
              </td>
              <td class="py-2 px-3 font-mono text-xs text-muted-foreground">
                {{ formatFileSize(element.file.size) }}
              </td>
              <td class="py-2 px-3 text-right">
                <button
                  class="text-muted-foreground hover:text-red-500 transition-colors"
                  @click.stop="handleRemove(element.id)"
                >
                  <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <FilePreviewModal
      :file="previewFile"
      :files="wizard.uploadedFiles.value"
      @close="previewFile = null"
      @update:file="previewFile = $event"
    />
  </div>
</template>
