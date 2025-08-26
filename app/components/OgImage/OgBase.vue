<script setup lang="ts">
import type { CSSProperties } from 'vue'

// inherited attrs can mess up the satori parser
defineOptions({
  inheritAttrs: false,
})

const cover: ComputedRef<CSSProperties> = computed(() => {
  return {
    objectFit: 'cover',
    objectPosition: 'center',
  }
})
</script>

<template>
  <img
    src="/opengraph/og-image.png"
    alt="Chaotic"
    :style="cover"
    class="h-full w-full"
  >
</template>
