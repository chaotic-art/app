<script setup lang="ts">
defineProps<{
  query: Record<string, any>
}>()

defineEmits<{
  (e: 'update:queryVariables', value: Record<string, any>): void
}>()
</script>

<template>
  <NftsToolbar
    @update:query-variables="$emit('update:queryVariables', $event)"
  />
</template>
