<script setup lang="ts">
defineProps<{
  studioIndexPath: string
  collectionName: string
  currentTab: string
}>()
</script>

<template>
  <header class="shrink-0 border-b border-border bg-background">
    <div class="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 min-w-0">
        <NuxtLink
          :to="studioIndexPath"
          class="flex items-center text-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
          aria-label="Back to collections"
        >
          <UIcon name="i-heroicons-arrow-left" class="size-5 shrink-0" />
        </NuxtLink>
        <span class="text-muted">/</span>
        <NuxtLink
          :to="studioIndexPath"
          class="text-muted hover:text-foreground truncate transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
        >
          studio
        </NuxtLink>
        <span class="text-muted">/</span>
        <span class="font-semibold text-foreground truncate">{{ collectionName }}</span>
        <span class="text-muted">/</span>
        <span class="text-foreground capitalize truncate">{{ currentTab }}</span>
      </nav>
      <UButton
        :to="studioIndexPath"
        variant="ghost"
        color="neutral"
        size="sm"
        class="shrink-0"
        aria-label="Close and return to studio"
      >
        Close
      </UButton>
    </div>
  </header>
</template>
