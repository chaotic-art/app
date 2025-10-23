<script setup lang="ts">
import { useParseDescriptionFile } from '~/composables/massmint/useParseDescriptionFile'

interface Props {
  disabled?: boolean
}

interface Emits {
  (e: 'fileLoaded', entries: Record<string, any>): void
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<Emits>()

const file = ref<File>()

const loading = ref(false)
const showCheckmark = ref(false)

watch(file, (newFile) => {
  onFileSelected(newFile)
})
function onFileSelected(file?: File) {
  showCheckmark.value = false

  if (!file) {
    emit('fileLoaded', {})
    return
  }

  loading.value = true

  const { entries, error, loading: isLoading } = useParseDescriptionFile(file!)

  watch(isLoading, (loadingDescFile) => {
    loading.value = loadingDescFile
    showCheckmark.value = !loadingDescFile
    if (!loadingDescFile && !error.value) {
      emit('fileLoaded', entries.value!)
    }
  })
}
</script>

<template>
  <div class="border-b border-border">
    <div class="p-6">
      <div class="flex items-center gap-4 pb-4">
        <h3 class="text-lg font-semibold">
          Upload Description File (Optional)
        </h3>
        <UIcon
          v-if="showCheckmark"
          name="i-heroicons-check-circle"
          class="w-6 h-6 text-green-500"
        />
      </div>

      <UFileUpload
        v-model="file"
        accept=".txt, .csv, .json"
        layout="list"
        :icon="loading ? 'i-heroicons-arrow-path' : 'i-heroicons-document-text'"
        label="Upload Description File"
        description="Supported formats: .TXT, .CSV, .JSON"
        color="neutral"
        size="lg"
        required
        :disabled="disabled"
      />
    </div>
  </div>
</template>
