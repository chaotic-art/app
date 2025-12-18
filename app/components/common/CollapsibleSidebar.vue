<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: boolean
  collapsedWidth?: string
  expandedWidth?: string
}>(), {
  collapsedWidth: '0',
  expandedWidth: '280px',
})

const isCollapsed = defineModel({ type: Boolean })
</script>

<template>
  <aside
    class="bg-background-muted border border-border rounded-xl sticky top-4 h-fit shrink-0 transition-all duration-300 ease-in-out overflow-hidden"
    :style="{
      width: isCollapsed ? collapsedWidth : expandedWidth,
      minWidth: isCollapsed ? collapsedWidth : expandedWidth,
    }"
  >
    <div v-show="!isCollapsed">
      <slot />
    </div>
  </aside>
</template>
