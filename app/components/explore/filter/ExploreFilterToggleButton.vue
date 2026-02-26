<script setup lang="ts">
import type { ExploreFilterScope } from '~/stores/preferences'

const props = defineProps<{
  filterScope: ExploreFilterScope
}>()

const mobileModalOpen = defineModel<boolean>('mobileModalOpen', { default: false })

const { sidebarCollapsed, openFilters, closeFilters, activeFiltersCount } = useExploreFilterToggleState(props.filterScope)
const { isMobileViewport: isMobile } = useViewport()

const icon = computed(() =>
  isMobile.value || sidebarCollapsed.value ? 'i-heroicons-funnel' : 'i-heroicons-chevron-double-left',
)

const tooltipText = computed(() =>
  sidebarCollapsed.value ? 'explore.showFilters' : 'explore.hideFilters',
)

function toggleFilters() {
  if (isMobile.value) {
    mobileModalOpen.value = true
    return
  }

  if (sidebarCollapsed.value) {
    openFilters()
  }
  else {
    closeFilters()
  }
}
</script>

<template>
  <ClientOnly>
    <div>
      <UTooltip :text="$t(tooltipText)">
        <UButton
          :icon="icon"
          color="neutral"
          variant="outline"
          size="sm"
          class="relative shrink-0 w-9! h-9 rounded-md!"
          :aria-label="$t(tooltipText)"
          @click="toggleFilters"
        >
          <UBadge
            v-if="sidebarCollapsed && activeFiltersCount > 0"
            :label="String(activeFiltersCount)"
            size="xs"
            class="absolute -top-1 -right-1"
          />
        </UButton>
      </UTooltip>
    </div>
  </ClientOnly>
</template>
