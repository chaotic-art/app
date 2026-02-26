<script setup lang="ts">
import { useElementBounding, useElementSize } from '@vueuse/core'

const props = withDefaults(defineProps<{
  rowClass?: string
}>(), {
  rowClass: '',
})

const containerRef = ref<HTMLElement | null>(null)
const anchorRef = ref<HTMLElement | null>(null)
const rowRef = ref<HTMLElement | null>(null)

const { bottom: anchorBottom } = useElementBounding(anchorRef)
const { left: containerLeft, width: containerWidth } = useElementBounding(containerRef)
const { height: rowHeight } = useElementSize(rowRef)

const isFixed = computed(() => {
  return Boolean(anchorRef.value) && anchorBottom.value <= 0
})

const placeholderStyle = computed(() => {
  if (!isFixed.value || !rowHeight.value) {
    return undefined
  }

  return {
    height: `${rowHeight.value}px`,
  }
})

const fixedStyle = computed(() => {
  if (!isFixed.value) {
    return undefined
  }

  return {
    backgroundColor: 'var(--ui-bg, var(--color-background))',
    left: `${Math.max(0, containerLeft.value)}px`,
    width: `${Math.max(0, containerWidth.value)}px`,
  }
})
</script>

<template>
  <div ref="containerRef" class="relative">
    <span
      ref="anchorRef"
      aria-hidden="true"
      class="absolute inset-x-0 top-0 h-px pointer-events-none opacity-0"
    />

    <div :style="placeholderStyle">
      <div
        ref="rowRef"
        :class="[
          props.rowClass,
          isFixed ? 'fixed top-0 z-30 border-b border-border py-2' : undefined,
        ]"
        :style="fixedStyle"
      >
        <slot :is-fixed="isFixed" />
      </div>
    </div>
  </div>
</template>
