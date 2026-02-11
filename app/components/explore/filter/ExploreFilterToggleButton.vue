<script setup lang="ts">
const { sidebarCollapsed, openFilters, activeFiltersCount } = useExploreFilterToggleState()
</script>

<template>
  <ClientOnly>
    <div v-if="sidebarCollapsed" class="hidden md:block">
      <UTooltip :text="$t('explore.showFilters')">
        <UButton
          icon="i-heroicons-chevron-right"
          color="neutral"
          variant="outline"
          size="sm"
          class="relative shrink-0 w-9! h-9 rounded-md!"
          :aria-label="$t('explore.showFilters')"
          @click="openFilters"
        >
          <UBadge
            v-if="activeFiltersCount > 0"
            :label="String(activeFiltersCount)"
            size="xs"
            class="absolute -top-1 -right-1"
          />
        </UButton>
      </UTooltip>
    </div>
  </ClientOnly>
</template>
