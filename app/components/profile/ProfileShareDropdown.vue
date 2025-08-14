<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const { $i18n } = useNuxtApp()
const { shareOnX, shareOnFarcaster } = useSocialShare()
const route = useRoute()
const { copy } = useClipboard()

const shareURL = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}${route.fullPath}`
  }
  return ''
})

function handleCopyLink() {
  copy(shareURL.value)
  successMessage($i18n.t('general.copyToClipboard'))
}

function handleShareOnX() {
  shareOnX('Share on X', shareURL.value, null)
}

function handleShareOnFarcaster() {
  shareOnFarcaster('Share on Farcaster', [shareURL.value])
}

const shareItems = computed(() => [
  {
    label: 'Copy Link',
    icon: 'i-heroicons-link',
    onSelect: handleCopyLink,
  },
  {
    label: 'Share on X',
    icon: 'i-simple-icons:x',
    onSelect: handleShareOnX,
  },
  {
    label: 'Share on Farcaster',
    icon: 'simple-icons:farcaster',
    onSelect: handleShareOnFarcaster,
  },
])
</script>

<template>
  <UDropdownMenu
    :items="shareItems"
    :content="{
      align: 'start',
      side: 'bottom',
      sideOffset: 8,
    }"
  >
    <UButton
      variant="outline"
      icon="i-heroicons-share"
      class="size-9"
    />
  </UDropdownMenu>
</template>
