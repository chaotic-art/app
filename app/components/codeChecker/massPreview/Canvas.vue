<script setup lang="ts">
import type { AssetMessage, CanvasPreviewItem } from '../types'

defineProps<{
  assets: Array<AssetMessage>
}>()

const previewItems = ref<CanvasPreviewItem[]>([])

// Initialize with some sample items
onMounted(() => {
  previewItems.value = Array.from({ length: 4 }, (_, i) => ({
    hash: `hash_${i + 1}`,
    loading: true,
    startedAt: Date.now(),
  }))
})
</script>

<template>
  <div class="w-full">
    <h3 class="text-lg font-semibold mb-4">
      {{ $t('codeChecker.massPreview') }}
    </h3>
    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="item in previewItems"
        :key="item.hash"
        class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <div class="aspect-square bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
          <UIcon
            v-if="item.loading"
            name="i-heroicons-arrow-path"
            class="text-2xl text-gray-400 animate-spin"
          />
          <UIcon
            v-else
            name="i-heroicons-photo"
            class="text-2xl text-gray-400"
          />
        </div>
        <p class="text-xs text-gray-500 mt-2 truncate">
          {{ item.hash }}
        </p>
      </div>
    </div>
  </div>
</template>
