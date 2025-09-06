<script setup lang="ts">
defineProps<{
  fileName?: string
}>()

const emits = defineEmits(['update:selectedFile', 'fileSelected', 'clear'])

const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  selectedFile.value = file
  if (file) {
    emits('fileSelected', file)
  }
  emits('update:selectedFile', file)
}

function triggerFileSelect() {
  fileInput.value?.click()
}

function clearSelection() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emits('clear')
}
</script>

<template>
  <div class="w-full">
    <input
      ref="fileInput"
      type="file"
      accept=".zip"
      class="hidden"
      @change="handleFileChange"
    >

    <div
      v-if="!selectedFile"
      class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
      @click="triggerFileSelect"
    >
      <UIcon
        name="i-heroicons-folder-arrow-up"
        class="text-2xl text-gray-400 mb-4"
      />
      <p class="text-lg font-medium mb-2">
        Drag Your <span class="font-bold">.Zip File</span> Here Or Click To Select
      </p>
      <p class="text-sm text-gray-500">
        {{ $t('codeChecker.supportedFormats') }}
      </p>
    </div>

    <div
      v-else
      class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between"
    >
      <div class="flex items-center gap-4 overflow-hidden">
        <UIcon
          name="i-heroicons-code-bracket"
          class="border border-gray-300 dark:border-gray-600 p-3 rounded-full text-gray-500"
        />
        <span class="text-ellipsis overflow-hidden">
          {{ fileName ?? selectedFile.name }}
        </span>
      </div>
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-heroicons-x-mark"
        size="sm"
        @click="clearSelection"
      />
    </div>
  </div>
</template>
