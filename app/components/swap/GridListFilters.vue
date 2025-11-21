<script setup lang="ts">
defineProps<{
  query: Record<string, any>
}>()

defineEmits<{
  (e: 'update:query-variables', value: Record<string, any>): void
}>()
</script>

<template>
  <NftsToolbar
    @update:query-variables="$emit('update:query-variables', $event)"
  />
</template>
