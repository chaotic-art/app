<script setup lang="ts">
import type { NFT, NFTS } from './types'
import UploadCompressedMedia from './upload/UploadCompressedMedia.vue'

const props = defineProps<{
  selectedCollection?: string
  nfts: NFTS
  mediaLoaded: boolean
  canGoToMetadataStep: boolean
}>()

const emit = defineEmits<{
  (e: 'mediaZipReordered', payload: { validFiles: NFT[], areAllFilesValid: boolean }): void
  (e: 'mediaZipLoaded', payload: { validFiles: NFT[], areAllFilesValid: boolean }): void
  (e: 'deleteNft', nft: NFT): void
  (e: 'next'): void
}>()

const mediaFiles = computed<NFT[]>(() =>
  Object.values(props.nfts as Record<string, NFT>),
)

const draggingMediaIndex = ref<number | null>(null)
const fileViewMode = ref<'grid' | 'list'>('grid')

function onMediaDragStart(index: number) {
  draggingMediaIndex.value = index
}

function onMediaDragEnd() {
  draggingMediaIndex.value = null
}

function onMediaDragOver(event: DragEvent) {
  event.preventDefault()
}

function onMediaDrop(targetIndex: number) {
  if (draggingMediaIndex.value === null || draggingMediaIndex.value === targetIndex) {
    return
  }

  const items = [...mediaFiles.value]
  const [moved] = items.splice(draggingMediaIndex.value, 1)

  if (!moved) {
    draggingMediaIndex.value = null
    return
  }

  items.splice(targetIndex, 0, moved)

  const reordered = items.map((nft, index) => ({ ...nft, id: index + 1 }))

  const reorderedMap = reordered.reduce<NFTS>(
    (acc, nft) => {
      acc[nft.id] = nft
      return acc
    },
    {},
  )

  emit('mediaZipReordered', { validFiles: Object.values(reorderedMap), areAllFilesValid: true })

  draggingMediaIndex.value = null
}

function setFileViewMode(mode: 'grid' | 'list') {
  fileViewMode.value = mode
}

function formatFileSize(file: File) {
  if (!file?.size) {
    return ''
  }

  const megabytes = file.size / (1024 * 1024)
  return `${megabytes.toFixed(1)} MB`
}

function onNext() {
  if (!props.canGoToMetadataStep) {
    return
  }

  emit('next')
}
</script>

<template>
  <section class="border border-border rounded-lg shadow-sm">
    <div class="space-y-4 p-6">
      <p class="mb-4 text-lg font-medium">
        Upload your art files. Drag and drop a ZIP or select files.
      </p>

      <UploadCompressedMedia
        :disabled="!selectedCollection"
        @zip-loaded="payload => emit('mediaZipLoaded', payload)"
      />

      <div
        v-if="mediaLoaded && mediaFiles.length"
        class="border-t border-border px-6 py-4"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-medium">
              Uploaded files
            </p>
            <p class="text-xs text-muted-foreground">
              Drag and drop to change the order of your files.
            </p>
          </div>

          <div class="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1">
            <button
              type="button"
              aria-label="Grid view"
              :aria-pressed="fileViewMode === 'grid'"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-xs"
              :class="fileViewMode === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground'"
              @click="setFileViewMode('grid')"
            >
              <UIcon
                name="i-heroicons-squares-2x2"
                class="h-4 w-4"
              />
            </button>
            <button
              type="button"
              aria-label="List view"
              :aria-pressed="fileViewMode === 'list'"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-xs"
              :class="fileViewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground'"
              @click="setFileViewMode('list')"
            >
              <UIcon
                name="i-heroicons-list-bullet"
                class="h-4 w-4"
              />
            </button>
          </div>
        </div>

        <div v-if="fileViewMode === 'list'" class="max-h-64 overflow-y-auto">
          <ul class="space-y-2">
            <li
              v-for="(nft, index) in mediaFiles"
              :key="nft.id"
              class="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
              draggable="true"
              @dragstart="onMediaDragStart(index)"
              @dragover="onMediaDragOver"
              @drop="onMediaDrop(index)"
              @dragend="onMediaDragEnd"
            >
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-heroicons-bars-3"
                  class="h-4 w-4 text-muted-foreground"
                />
                <span class="w-6 font-mono text-xs text-muted-foreground">
                  {{ index + 1 }}
                </span>
                <div class="flex items-center gap-3">
                  <div class="h-5 w-5 shrink-0 overflow-hidden rounded bg-muted">
                    <img
                      v-if="nft.imageUrl"
                      :src="nft.imageUrl"
                      :alt="nft.name || nft.file?.name || `NFT ${nft.id}`"
                      loading="lazy"
                      decoding="async"
                      class="h-full w-full object-cover"
                    >
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center"
                    >
                      <UIcon
                        name="i-heroicons-photo"
                        class="h-3 w-3 text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <span class="max-w-[220px] truncate md:max-w-[360px]">
                      {{ nft.file?.name || `File #${nft.id}` }}
                    </span>
                    <span class="text-xs text-muted-foreground">
                      File · {{ formatFileSize(nft.file) }}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                aria-label="Delete file"
                class="inline-flex h-7 w-7 items-center justify-center rounded-md text-xs text-muted-foreground hover:text-destructive"
                @click="emit('deleteNft', nft)"
              >
                <UIcon
                  name="i-heroicons-trash"
                  class="h-4 w-4"
                />
              </button>
            </li>
          </ul>
        </div>

        <div
          v-else
          class="max-h-64 overflow-y-auto"
        >
          <div class="grid grid-cols-5 gap-2 md:grid-cols-8">
            <div
              v-for="(nft, index) in mediaFiles"
              :key="nft.id"
              class="flex cursor-grab flex-col rounded border border-border bg-muted/40 p-1.5 text-[10px]"
              draggable="true"
              @dragstart="onMediaDragStart(index)"
              @dragover="onMediaDragOver"
              @drop="onMediaDrop(index)"
              @dragend="onMediaDragEnd"
            >
              <div class="relative mb-1 w-full overflow-hidden rounded bg-muted" style="aspect-ratio: 1 / 1;">
                <img
                  v-if="nft.imageUrl"
                  :src="nft.imageUrl"
                  :alt="nft.name || nft.file?.name || `NFT ${nft.id}`"
                  loading="lazy"
                  decoding="async"
                  class="h-full w-full object-cover"
                >
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-photo"
                    class="h-3 w-3 text-muted-foreground"
                  />
                </div>
                <div class="absolute left-0.5 top-0.5 rounded-full bg-background/80 px-1 py-0.5 text-[9px] font-medium text-foreground">
                  #{{ index + 1 }}
                </div>
              </div>
              <div class="flex flex-1 flex-col justify-between gap-0.5">
                <span class="line-clamp-2 text-[10px] font-medium">
                  {{ nft.file?.name || `File #${nft.id}` }}
                </span>
                <div class="flex items-center justify-between text-[9px] text-muted-foreground">
                  <span class="truncate">
                    {{ formatFileSize(nft.file) }}
                  </span>
                  <button
                    type="button"
                    aria-label="Delete file"
                    class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded hover:text-destructive"
                    @click="emit('deleteNft', nft)"
                  >
                    <UIcon
                      name="i-heroicons-trash"
                      class="h-2.5 w-2.5"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-border px-6 py-4">
      <span class="text-sm text-muted-foreground">
        Step 2 of 5 · Upload media files to continue.
      </span>
      <UButton
        size="sm"
        :disabled="!canGoToMetadataStep"
        @click="onNext"
      >
        Next: Metadata
      </UButton>
    </div>
  </section>
</template>
