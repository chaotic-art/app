<script setup lang="ts">
defineProps<{
  name?: string
  image?: string
  itemCount?: number | string
  chain: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="flex items-center gap-3 p-4 border-b border-border">
    <div class="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
      <img
        v-if="image"
        :src="sanitizeIpfsUrl(image)"
        :alt="name || 'Collection'"
        class="w-full h-full object-cover"
      >
      <div v-else class="w-full h-full flex items-center justify-center">
        <UIcon name="i-heroicons-photo" class="w-6 h-6 text-muted-foreground" />
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-sm truncate">
        {{ name || 'Untitled Collection' }}
      </h3>
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <span><span class="font-mono">{{ itemCount ?? 0 }}</span> items</span>
        <UBadge :label="chain" size="xs" variant="subtle" class="font-mono" />
      </div>
    </div>

    <UButton
      variant="ghost"
      icon="i-heroicons-x-mark"
      size="xs"
      @click="emit('close')"
    />
  </div>
</template>
