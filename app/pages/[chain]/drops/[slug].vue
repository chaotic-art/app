<script setup lang="ts">
const dropStore = useDropStore()
useDrop()

onBeforeMount(() => dropStore.reset())
onUnmounted(() => dropStore.reset())
</script>

<template>
  <GenerativeDrop />
</template>
