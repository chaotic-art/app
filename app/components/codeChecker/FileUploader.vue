<script setup lang="ts">
defineProps<{
  fileName?: string
}>()

const emits = defineEmits(['update:selectedFile', 'fileSelected', 'clear'])

const selectedFile = ref<File | null>(null)

function handleFileChange(file: File | null | undefined) {
  selectedFile.value = file ?? null
  if (selectedFile.value) {
    emits('fileSelected', selectedFile.value)
  }
  else {
    emits('clear')
  }
  emits('update:selectedFile', selectedFile.value)
}

function handleRemoveFile() {
  handleFileChange(null)
}
</script>

<template>
  <div class="w-full">
    <UFileUpload
      v-if="!selectedFile"
      v-model="selectedFile"
      label="Drag Your .Zip File Here Or Click To Select"
      :description="$t('codeChecker.supportedFormats')"
      accept=".zip"
      class="w-full"
      @update:model-value="handleFileChange"
    />
    <div
      v-if="selectedFile"
      class="border border-border rounded-lg p-4 flex items-center justify-between"
    >
      <div class="flex items-center gap-4 overflow-hidden">
        <UIcon
          name="i-heroicons-code-bracket"
          class="border border-border p-3 rounded-full text-muted-foreground"
        />
        <span class="text-ellipsis overflow-hidden">
          {{ fileName ?? selectedFile?.name }}
        </span>
      </div>
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-heroicons-x-mark"
        size="sm"
        @click="handleRemoveFile"
      />
    </div>
  </div>
</template>
