<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  modelValue: File | null
  preview?: string
  maxSizeInMb?: number
}>()
const emit = defineEmits(['clear'])
const ONE_MB = 1024 * 1024

const vSelectedFile = useVModel(props, 'modelValue')

const selectedFilePreview = computed(() =>
  vSelectedFile.value ? URL.createObjectURL(vSelectedFile.value as File) : '',
)

function clear() {
  vSelectedFile.value = null
  emit('clear')
}

function fileSelected(file: File | null) {
  if (file && props.maxSizeInMb && file.size > props.maxSizeInMb * ONE_MB) {
    vSelectedFile.value = null
    errorMessage(`The uploaded file exceeds the ${props.maxSizeInMb}MB size limit.`)
    return
  }
  vSelectedFile.value = file
}
</script>

<template>
  <UFileUpload
    v-slot="{ open }"
    v-model="vSelectedFile"
    accept="image/*"
    drag-drop
    expanded
    native
    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
    @update:model-value="fileSelected as unknown"
  >
    <div
      class="flex items-center gap-4 relative"
      @click="open()"
    >
      <div
        v-if="!vSelectedFile && !preview"
        class="flex items-center justify-center bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <UIcon
          name="i-heroicons-arrow-up-tray"
          class="w-6 h-6 text-gray-400 dark:text-gray-500"
        />
      </div>
      <img
        v-else
        :src="selectedFilePreview || preview"
        alt="Selected file"
        class="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
      >
      <span class="text-gray-600 dark:text-gray-300 text-sm">
        {{ vSelectedFile?.name ?? 'Click To Select A File' }}
      </span>
      <UButton
        v-if="vSelectedFile || preview"
        class="absolute right-2 top-2"
        variant="ghost"
        size="sm"
        icon="i-heroicons-x-mark"
        @click="clear"
      />
    </div>
  </UFileUpload>
</template>
