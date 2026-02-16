<script setup lang="ts">
import type { MassMintFile } from '~/components/massmint/types'

const props = defineProps<{
  file: MassMintFile | null
  files: MassMintFile[]
}>()

const emit = defineEmits<{
  'close': []
  'update:file': [file: MassMintFile | null]
}>()

function navigatePreview(direction: 1 | -1) {
  if (!props.file)
    return
  const currentIndex = props.files.findIndex(f => f.id === props.file!.id)
  const nextIndex = currentIndex + direction
  if (nextIndex >= 0 && nextIndex < props.files.length) {
    emit('update:file', props.files[nextIndex]!)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="file"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <!-- Close -->
        <button
          class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          @click="emit('close')"
        >
          <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
        </button>

        <!-- Nav: Previous -->
        <button
          v-if="file.order > 0"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          @click="navigatePreview(-1)"
        >
          <UIcon name="i-heroicons-chevron-left" class="w-6 h-6" />
        </button>

        <!-- Nav: Next -->
        <button
          v-if="file.order < files.length - 1"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          @click="navigatePreview(1)"
        >
          <UIcon name="i-heroicons-chevron-right" class="w-6 h-6" />
        </button>

        <!-- Content -->
        <div class="flex flex-col items-center gap-4 max-w-[80vw] max-h-[80vh]">
          <img
            v-if="file.file.type?.startsWith('image/')"
            :src="file.thumbnailUrl"
            :alt="file.file.name"
            class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
          >
          <div
            v-else
            class="w-64 h-64 bg-white/10 rounded-lg flex items-center justify-center"
          >
            <UIcon
              :name="file.file.type?.startsWith('video/') ? 'i-heroicons-film' : file.file.type?.startsWith('audio/') ? 'i-heroicons-musical-note' : 'i-heroicons-document'"
              class="w-16 h-16 text-white/60"
            />
          </div>

          <!-- Info bar -->
          <div class="text-center text-white space-y-1">
            <p v-if="file.name" class="font-medium text-sm">
              {{ file.name }}
            </p>
            <p class="font-mono text-sm" :class="file.name ? 'text-white/60' : ''">
              {{ file.file.name }}
            </p>
            <p class="text-xs text-white/60 font-mono">
              {{ formatFileSize(file.file.size) }} · {{ getFileTypeLabel(file.file.type || '') }} · #{{ file.order + 1 }} of {{ files.length }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
