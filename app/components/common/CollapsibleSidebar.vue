<script setup lang="ts">
import { useElementVisibility } from '@vueuse/core'

withDefaults(defineProps<{
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
const target = ref()
const isTargetVisible = useElementVisibility(target)
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
        'fixed top-[100px]': sticky && !isTargetVisible,
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
