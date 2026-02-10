<script setup lang="ts">
import { useElementBounding, useElementSize, useIntersectionObserver, useWindowSize } from '@vueuse/core'

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
const FIXED_TOP_OFFSET = 100
const FIXED_BOTTOM_OFFSET = 16

const isCollapsed = defineModel({ type: Boolean })
const target = ref<HTMLElement | null>(null)
const sidebarRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const hasMeasured = ref(false)
const isTargetVisible = ref(true)

useIntersectionObserver(target, ([entry]) => {
  if (!entry) {
    return
  }

  hasMeasured.value = true
  isTargetVisible.value = entry.isIntersecting
})

const { height: sidebarHeight } = useElementSize(sidebarRef)
const { height: windowHeight } = useWindowSize()
const { bottom: containerBottom } = useElementBounding(containerRef)

const fitsInViewport = computed(() => sidebarHeight.value <= windowHeight.value - FIXED_TOP_OFFSET - FIXED_BOTTOM_OFFSET)
const hasRoomBeforeBottom = computed(() => containerBottom.value >= FIXED_TOP_OFFSET + sidebarHeight.value + FIXED_BOTTOM_OFFSET)

const isFixed = computed(() => props.sticky && hasMeasured.value && !isTargetVisible.value && fitsInViewport.value && hasRoomBeforeBottom.value)
</script>

<template>
  <div
    ref="containerRef"
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
      ref="sidebarRef"
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
