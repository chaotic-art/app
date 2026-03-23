<script setup lang="ts">
import { sanitizeIpfsUrl } from '~/utils/ipfs'

export interface StudioNavItem {
  id: string
  label: string
  icon: string
}

const props = defineProps<{
  collectionName: string
  collectionImage?: string
  itemCount: string
  currentTab: string
  navItems: StudioNavItem[]
  collectionPagePath: string
  massMintPath: string
  nftMintPath: string
}>()

const emit = defineEmits<{
  selectTab: [tab: string]
  deleteCollection: []
}>()

const imageLoadFailed = ref(false)

watch(() => props.collectionImage, () => {
  imageLoadFailed.value = false
})

const { currentChain } = useChain()
</script>

<template>
  <aside
    class="shrink-0 h-full min-h-0 overflow-hidden border-r border-border bg-background flex flex-col py-4 px-2 w-16 md:w-64 md:py-6 md:px-4"
    aria-label="Collection sidebar"
  >
    <div class="hidden md:flex items-center gap-3 mb-6">
      <div
        class="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center"
      >
        <img
          v-if="collectionImage && !imageLoadFailed"
          :src="sanitizeIpfsUrl(collectionImage)"
          :alt="`${collectionName} collection`"
          class="w-full h-full object-cover"
          @error="imageLoadFailed = true"
        >
        <UIcon
          v-else
          name="i-heroicons-photo"
          class="w-10 h-10 text-muted"
        />
      </div>
      <div class="min-w-0 flex-1">
        <div class="font-bold text-foreground truncate">
          {{ collectionName }}
        </div>
        <div class="flex items-center gap-2 text-sm text-muted mt-0.5">
          {{ itemCount }} items
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted"
          >
            {{ currentChain }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex md:hidden flex-col items-center flex-1 min-h-0 pt-1">
      <div class="mb-4">
        <div
          class="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center"
          :aria-label="`${collectionName} collection`"
          role="img"
        >
          <img
            v-if="collectionImage && !imageLoadFailed"
            :src="sanitizeIpfsUrl(collectionImage)"
            :alt="`${collectionName} collection`"
            class="w-full h-full object-cover"
            @error="imageLoadFailed = true"
          >
          <UIcon
            v-else
            name="i-heroicons-photo"
            class="w-6 h-6 text-muted"
          />
        </div>
      </div>

      <nav
        class="flex flex-col items-center gap-4"
        aria-label="Collection sections"
      >
        <UButton
          v-for="item in navItems"
          :key="item.id"
          :icon="item.icon"
          :variant="currentTab === item.id ? 'soft' : 'ghost'"
          color="neutral"
          size="lg"
          class="rounded-full w-10 h-10 justify-center p-0"
          :aria-label="item.label"
          @click="emit('selectTab', item.id)"
        />
      </nav>

      <div class="mt-6 flex flex-col items-center gap-3">
        <UButton
          :to="nftMintPath"
          icon="i-heroicons-plus"
          :variant="currentTab === 'nftmint' ? 'soft' : 'outline'"
          color="neutral"
          size="lg"
          class="rounded-full w-10 h-10 justify-center p-0"
          aria-label="Create NFT"
        />
        <UButton
          :to="massMintPath"
          icon="i-heroicons-sparkles"
          color="primary"
          size="lg"
          class="rounded-full w-10 h-10 justify-center p-0"
          aria-label="Mass mint"
        />
      </div>

      <div class="mt-auto flex flex-col items-center gap-3 pb-2">
        <UButton
          :to="collectionPagePath"
          variant="ghost"
          color="neutral"
          size="lg"
          icon="i-heroicons-arrow-top-right-on-square"
          class="rounded-full w-10 h-10 justify-center p-0 text-muted hover:text-foreground"
          aria-label="View collection"
        />
        <UButton
          variant="ghost"
          color="error"
          size="lg"
          icon="i-heroicons-trash"
          class="rounded-full w-10 h-10 justify-center p-0"
          aria-label="Delete collection"
          @click="emit('deleteCollection')"
        />
      </div>
    </div>

    <nav
      class="hidden md:flex flex-col gap-1 mb-6"
      aria-label="Collection sections"
    >
      <UButton
        v-for="item in navItems"
        :key="item.id"
        :icon="item.icon"
        :variant="currentTab === item.id ? 'soft' : 'ghost'"
        color="neutral"
        size="sm"
        class="w-full justify-start font-medium rounded-md"
        @click="emit('selectTab', item.id)"
      >
        {{ item.label }}
      </UButton>
    </nav>

    <div class="hidden md:block">
      <UButton
        :to="nftMintPath"
        icon="i-heroicons-plus"
        :variant="currentTab === 'nftmint' ? 'soft' : 'outline'"
        color="neutral"
        size="md"
        class="w-full justify-center mb-2"
      >
        Create NFT
      </UButton>

      <UButton
        :to="massMintPath"
        icon="i-heroicons-sparkles"
        color="primary"
        size="md"
        class="w-full justify-center mb-6"
      >
        Mass Mint
      </UButton>
    </div>

    <div class="hidden md:flex mt-auto flex-col gap-2 pt-4 border-t border-border">
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
