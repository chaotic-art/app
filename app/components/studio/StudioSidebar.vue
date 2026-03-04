<script setup lang="ts">
import { sanitizeIpfsUrl } from '~/utils/ipfs'

export interface StudioNavItem {
  id: string
  label: string
  icon: string
}

defineProps<{
  collectionName: string
  collectionImage?: string
  itemCount: string
  currentTab: string
  navItems: StudioNavItem[]
  collectionPagePath: string
}>()

const emit = defineEmits<{
  selectTab: [tab: string]
  deleteCollection: []
}>()

const { prefix } = usePrefix()
</script>

<template>
  <aside
    class="shrink-0 w-64 border-r border-border bg-background flex flex-col py-6 px-4"
    aria-label="Collection sidebar"
  >
    <!-- Collection identity -->
    <div class="flex flex-col items-start gap-3 mb-6">
      <div
        class="size-20 rounded-xl overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center"
      >
        <img
          v-if="collectionImage"
          :src="sanitizeIpfsUrl(collectionImage)"
          :alt="`${collectionName} collection`"
          class="w-full h-full object-cover"
          @error="(e) => { const el = (e.target as HTMLImageElement); if (el) el.style.display = 'none' }"
        >
        <UIcon
          v-else
          name="i-heroicons-photo"
          class="w-10 h-10 text-muted"
        />
      </div>
      <div class="min-w-0 w-full">
        <div class="font-semibold text-foreground truncate">
          {{ collectionName }}
        </div>
        <div class="flex items-center gap-2  text-sm text-muted mt-0.5">
          {{ itemCount }} items

          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-muted"
          >
            {{ prefix }}
          </span>
        </div>
      </div>
    </div>

    <nav class="flex flex-col gap-1 mb-6" aria-label="Collection sections">
      <UButton
        v-for="item in navItems"
        :key="item.id"
        :icon="item.icon"
        :variant="currentTab === item.id ? 'soft' : 'ghost'"
        color="neutral"
        size="sm"
        class="w-full justify-start font-medium"
        @click="emit('selectTab', item.id)"
      >
        {{ item.label }}
      </UButton>
    </nav>

    <!-- Mass Mint -->
    <UButton
      icon="i-heroicons-sparkles"
      color="primary"
      size="md"
      class="w-full justify-center mb-6"
    >
      Mass Mint
    </UButton>

    <!-- Secondary actions -->
    <div class="mt-auto flex flex-col gap-2 pt-4 border-t border-border">
      <UButton
        :to="collectionPagePath"
        variant="ghost"
        color="neutral"
        size="sm"
        icon="i-heroicons-arrow-top-right-on-square"
        class="w-full justify-start text-muted hover:text-foreground"
      >
        View Collection
      </UButton>
      <UButton
        variant="ghost"
        color="error"
        size="sm"
        icon="i-heroicons-trash"
        class="w-full justify-start"
        @click="emit('deleteCollection')"
      >
        Delete Collection
      </UButton>
    </div>
  </aside>
</template>
