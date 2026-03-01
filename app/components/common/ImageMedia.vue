<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  fallbackSrc?: string
}>(), {
  src: '',
  alt: '',
  fallbackSrc: '/placeholder.jpg',
})

const resolvedSrc = computed(() => props.src || props.fallbackSrc)

function handleError(event: Event) {
  const image = event.target as HTMLImageElement

  if (image.src.endsWith(props.fallbackSrc)) {
    return
  }

  image.src = props.fallbackSrc
}
</script>

<template>
  <img
    :src="resolvedSrc"
    :alt="alt"
    v-bind="$attrs"
    @error="handleError"
  >
</template>
