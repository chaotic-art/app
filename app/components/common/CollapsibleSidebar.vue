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

const scrolledPastTop = ref(false)
const hasScrolledPastTarget = computed(() => props.sticky && scrolledPastTop.value)

useIntersectionObserver(target, ([entry]: IntersectionObserverEntry[]) => {
  if (!entry) {
    return
  }

  const isAboveViewport = !entry.isIntersecting
    && entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0)

  scrolledPastTop.value = isAboveViewport
})

const { height: sidebarHeight } = useElementSize(sidebarRef)
const { height: windowHeight } = useWindowSize()
const { bottom: containerBottom } = useElementBounding(containerRef)

const availableHeight = computed(() => windowHeight.value - FIXED_TOP_OFFSET - FIXED_BOTTOM_OFFSET)
const fitsInViewport = computed(() => sidebarHeight.value <= availableHeight.value)
const hasRoomBeforeBottom = computed(() => containerBottom.value >= FIXED_TOP_OFFSET + sidebarHeight.value + FIXED_BOTTOM_OFFSET)

const isFixed = computed(() => hasScrolledPastTarget.value && fitsInViewport.value && hasRoomBeforeBottom.value)
</script>

<template>
  <div
    ref="containerRef"
    class="shrink-0"
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
      class="h-fit overflow-hidden"
      :class="{
        'bg-background-muted border border-border rounded-xl': !isCollapsed,
        'border-transparent bg-transparent rounded-none pointer-events-none': isCollapsed,
        'sticky top-4': !sticky,
        'fixed top-[100px] z-10': isFixed,
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
