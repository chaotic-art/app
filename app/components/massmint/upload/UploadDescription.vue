<script setup lang="ts">
interface Props {
  disabled?: boolean
}

// interface Emits {
//   (e: 'fileLoaded', entries: Record<string, any>): void
// }

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

// const emit = defineEmits<Emits>()

const loading = ref(false)
const showCheckmark = ref(false)

const acceptedMediaFormatsString = '.TXT, .CSV, .JSON'

function handleClick() {
  if (!props.disabled) {
    // TODO: Implement file input trigger
    console.warn('Description file input clicked')
  }
}
</script>

<template>
  <div class="border-b border-border">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">
          Upload Description File (Optional)
        </h3>
        <UIcon
          v-if="showCheckmark"
          name="i-heroicons-check-circle"
          class="w-6 h-6 text-green-500"
        />
      </div>

      <div
        class="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-border/80 transition-colors cursor-pointer"
        :class="{ 'opacity-50': disabled }"
        @click="handleClick"
      >
        <UIcon
          v-if="loading"
          name="i-heroicons-arrow-path"
          class="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin"
        />
        <UIcon
          v-else
          name="i-heroicons-document-text"
          class="w-12 h-12 text-muted-foreground mx-auto mb-4"
        />
        <p class="text-lg font-medium mb-2">
          Upload Description File
        </p>
        <p class="text-sm text-muted-foreground mb-4">
          <span class="font-bold">Supported formats:</span>
          {{ acceptedMediaFormatsString }}
        </p>
        <p class="text-sm text-muted-foreground">
          Drop your file here or click to select
        </p>
      </div>
    </div>
  </div>
</template>
