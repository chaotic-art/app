<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string
    alt?: string
    size?: string
  }>(),
  {
    size: '12',
  },
)
</script>

<template>
  <div
    class="bg-gray-200 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden flex-shrink-0"
    :class="`w-${size} h-${size}`"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt || 'NFT'"
      class="w-full h-full object-cover"
      @error="($event.target as HTMLImageElement).style.display = 'none'"
    >
    <div
      v-else
      class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-neutral-700"
    >
      <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
    </div>
  </div>
</template>
