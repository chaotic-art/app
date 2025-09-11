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
      class="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-border/80 transition-colors"
      @click="triggerFileSelect"
    >
      <UIcon
        name="i-heroicons-folder-arrow-up"
        class="text-2xl text-muted-foreground mb-4"
      />
      <p class="text-lg font-medium mb-2">
        Drag Your <span class="font-bold">.Zip File</span> Here Or Click To Select
      </p>
      <p class="text-sm text-muted-foreground">
        {{ $t('codeChecker.supportedFormats') }}
      </p>
    </div>

    <div
      v-else
      class="border border-border rounded-lg p-4 flex items-center justify-between"
    >
      <div class="flex items-center gap-4 overflow-hidden">
        <UIcon
          name="i-heroicons-code-bracket"
          class="border border-border p-3 rounded-full text-muted-foreground"
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
