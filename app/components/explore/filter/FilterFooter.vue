<script setup lang="ts">
defineEmits<{
  apply: []
  clear: []
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <UButton class="w-full" @click="$emit('apply')">
      {{ $t('explore.applyFilters') }}
    </UButton>
    <UButton class="w-full" variant="link" @click="$emit('clear')">
      {{ $t('explore.clearAll') }}
    </UButton>
  </div>
</template>
