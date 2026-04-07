<script setup lang="ts">
import type { NftViewMode, NftViewModeScope } from '~/stores/preferences'
import { toRef } from 'vue'

const props = defineProps<{
  scope: NftViewModeScope
}>()

const { isMobileViewport } = useViewport()
const { viewMode, setViewMode, cycleViewMode } = useNftViewMode(toRef(props, 'scope'))

interface ViewModeOption {
  value: NftViewMode
  label: string
  icon: string
}

const options: ViewModeOption[] = [
  { value: 'grid', label: 'Grid', icon: 'i-lucide-grid-2x2' },
  { value: 'compact', label: 'Compact', icon: 'i-lucide-grid-3x3' },
  { value: 'art', label: 'Mosaic', icon: 'i-lucide-layout-grid' },
]

const activeOption = computed<ViewModeOption>(() => {
  return options.find(option => option.value === viewMode.value) ?? options[0]!
})

const mobileAriaLabel = computed(() => {
  return `Cycle NFT view mode. Current mode: ${activeOption.value.label}`
})
</script>

<template>
  <ClientOnly>
    <UButton
      v-if="isMobileViewport"
      :icon="activeOption.icon"
      color="neutral"
      variant="outline"
      size="sm"
      class="relative shrink-0 w-9! h-9 rounded-md!"
      :aria-label="mobileAriaLabel"
      @click="cycleViewMode"
    />

    <div v-else class="flex items-center gap-1">
      <UTooltip
        v-for="option in options"
        :key="option.value"
        :text="option.label"
      >
        <UButton
          :icon="option.icon"
          size="sm"
          class="relative shrink-0 w-9! h-9 rounded-md!"
          :color="viewMode === option.value ? 'primary' : 'neutral'"
          :variant="viewMode === option.value ? 'solid' : 'outline'"
          :aria-label="`Switch NFT view to ${option.label}`"
          @click="setViewMode(option.value)"
        />
      </UTooltip>
    </div>
  </ClientOnly>
</template>
