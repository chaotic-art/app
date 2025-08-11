<script setup lang="ts">
import type { OdaToken } from '@/services/oda'
import { downloadImage } from '@/utils/download'
import { isMobileDevice } from '@/utils/environment'
import { sanitizeIpfsUrl, toOriginalContentUrl } from '@/utils/ipfs'
import { onKodahashRenderCompleted } from '@/utils/kodahash'

const props = defineProps<{
  containerId: string
  nft: OdaToken
  mimeType?: string
}>()

defineEmits(['toggleFullscreen'])

const nftImageUrl = computed(() => sanitizeIpfsUrl(props.nft.metadata?.image))
const nftAnimation = computed(() => sanitizeIpfsUrl(props.nft.metadata?.animation_url))

// Use passed mimeType prop or fallback to metadata
const nftMimeType = computed(() => props.mimeType || props.nft.metadata?.mime_type)

const toast = useToast()
const { $i18n } = useNuxtApp()
const imageData = ref()

const isDownloadEnabled = computed(() => {
  const mimeType = nftMimeType.value
  return ((
    (mimeType?.includes('image') || mimeType?.includes('text/html'))
    && nftImageUrl.value) || imageData.value
  )
})

async function downloadMedia() {
  let imageUrl = sanitizeIpfsUrl(nftImageUrl.value)

  if (!imageUrl) {
    return
  }

  if (imageData.value) {
    const blob = await $fetch<Blob>(imageData.value)
    imageUrl = URL.createObjectURL(blob)
  }
  else if (nftMimeType.value?.includes('image')) {
    imageUrl = toOriginalContentUrl(imageUrl)
  }

  if (isMobileDevice) {
    toast.add({ title: $i18n.t('toast.downloadOnMobile') })
    setTimeout(() => {
      window.open(imageUrl, '_blank')
    }, 2000)
    return
  }

  try {
    toast.add({ title: $i18n.t('toast.downloadImage') })
    downloadImage(imageUrl, props.nft.metadata?.name ?? '')
  }
  catch (error) {
    console.warn('[ERR] unable to fetch image', error)
    toast.add({ title: $i18n.t('toast.downloadError') })
  }
}

function handleNewTab() {
  // Open animation if it exists, otherwise open image
  if (nftAnimation.value) {
    window.open(nftAnimation.value, '_blank')
  }
  else if (nftImageUrl.value) {
    window.open(nftImageUrl.value, '_blank')
  }
}

const isNewTabEnabled = computed(() => {
  // Enable if we have animation or image URL
  return (nftAnimation.value || nftImageUrl.value) && nftMimeType.value
})

onKodahashRenderCompleted(({ payload }) => {
  imageData.value = payload.image
})
</script>

<template>
  <div class="flex justify-center mt-4 md:mt-6">
    <div class="inline-flex items-center gap-1 p-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <!-- Fullscreen Button -->
      <UTooltip text="Fullscreen" :popper="{ placement: 'top' }">
        <UButton
          icon="i-heroicons-arrows-pointing-out"
          variant="ghost"
          color="neutral"
          size="sm"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          @click="$emit('toggleFullscreen')"
        />
      </UTooltip>

      <!-- Separator -->
      <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      <!-- Open in New Tab Button -->
      <UTooltip text="Open in New Tab" :popper="{ placement: 'top' }">
        <UButton
          icon="i-heroicons-arrow-top-right-on-square"
          variant="ghost"
          color="neutral"
          size="sm"
          :disabled="!isNewTabEnabled"
          :class="isNewTabEnabled
            ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'"
          @click="isNewTabEnabled ? handleNewTab() : undefined"
        />
      </UTooltip>

      <!-- Separator -->
      <div v-if="isDownloadEnabled" class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      <!-- Download Button -->
      <UTooltip v-if="isDownloadEnabled" text="Download" :popper="{ placement: 'top' }">
        <UButton
          icon="i-heroicons-arrow-down-tray"
          variant="ghost"
          color="neutral"
          size="sm"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          @click="downloadMedia"
        />
      </UTooltip>
    </div>
  </div>
</template>
