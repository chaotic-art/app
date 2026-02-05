<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  collapsedWidth?: string
  expandedWidth?: string
  sticky?: boolean
}>(), {
  collapsedWidth: '0',
  expandedWidth: '280px',
  sticky: false,
})

const isCollapsed = defineModel({ type: Boolean })
const target = ref<HTMLElement | null>(null)
const hasMeasured = ref(false)
const isTargetVisible = ref(true)

useIntersectionObserver(target, ([entry]) => {
  if (!entry) {
    return
  }

  hasMeasured.value = true
  isTargetVisible.value = entry.isIntersecting
})

const isFixed = computed(() => props.sticky && hasMeasured.value && !isTargetVisible.value)
</script>

<template>
  <div
    class="shrink-0 transition-all duration-300 ease-in-out"
    :style="{
      width: isCollapsed ? collapsedWidth : expandedWidth,
      minWidth: isCollapsed ? collapsedWidth : expandedWidth,
    }"
  >
    <span
      v-if="sticky"
      ref="target"
      class="block relative top-[-100px]"
    />

    <aside
      class="bg-background-muted border border-border rounded-xl h-fit transition-all duration-300 ease-in-out overflow-hidden"
      :class="{
        'sticky top-4': !sticky,
        'fixed top-[100px]': isFixed,
      }"
      :style="{
        width: isCollapsed ? collapsedWidth : expandedWidth,
        minWidth: isCollapsed ? collapsedWidth : expandedWidth,
      }"
    >
      <div v-show="!isCollapsed">
        <slot />
      </div>
    </aside>
  </div>
</template>
