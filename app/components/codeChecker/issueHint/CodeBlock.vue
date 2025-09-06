<script setup lang="ts">
defineProps<{
  code: string
  lang?: string
}>()
</script>

<template>
  <div class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
    <pre><code class="text-sm">{{ code }}</code></pre>
  </div>
</template>
