<script setup lang="ts">
import type { OdaToken, OnchainCollection } from '~/services/oda'
import { useFullscreen } from '@vueuse/core'
import { MediaType, resolveMedia } from '@/utils/gallery/media'

interface Props {
  tokenData: OdaToken | null
  collectionData: OnchainCollection | null
  mimeType?: string
  mediaIcon: string
  containerId: string
}

const props = defineProps<Props>()

const imageStatus = ref<'normal' | 'fallback'>('normal')
const fullScreenDisabled = ref(false)
const mediaItemRef = ref<HTMLDivElement & { toggleFullscreen: () => void } | null>(null)
const { toggle, isFullscreen, isSupported } = useFullscreen(mediaItemRef)

function toggleMediaFullscreen() {
  if (!isSupported.value || fullScreenDisabled.value) {
    return
  }
  toggle().catch(() => {
    fullScreenDisabled.value = true
  })
}

function toggleFullscreen() {
  if (!props.mimeType) {
    toggleMediaFullscreen()
    return
  }

  const mediaType = resolveMedia(props.mimeType)
  if ([MediaType.VIDEO].includes(mediaType)) {
    mediaItemRef.value?.toggleFullscreen()
  }
  else {
    toggleMediaFullscreen()
  }
}

defineExpose({
  toggleFullscreen,
})
</script>

<template>
  <div class="relative overflow-hidden group">
    <div
      :id="containerId"
      ref="mediaItemRef"
      class="relative"
    >
      <!-- Video Media -->
      <video
        v-if="mimeType?.includes('video') && (tokenData?.metadata?.animation_url || tokenData?.metadata?.image)"
        :src="sanitizeIpfsUrl(tokenData?.metadata?.animation_url || tokenData?.metadata?.image)"
        :alt="tokenData?.metadata?.name || 'NFT'"
        class="aspect-square w-full object-cover"
        controls
        muted
        @error="($event.target as HTMLVideoElement).style.display = 'none'"
      />

      <!-- Audio Media -->
      <div
        v-else-if="mimeType?.includes('audio') && (tokenData?.metadata?.animation_url || tokenData?.metadata?.image)"
        class="aspect-square w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-900 relative p-4 md:p-6"
      >
        <UIcon name="i-heroicons-musical-note" class="w-12 h-12 md:w-16 md:h-16 text-primary mb-3 md:mb-4" />
        <audio
          :src="sanitizeIpfsUrl(tokenData?.metadata?.animation_url || tokenData?.metadata?.image)"
          controls
          class="w-full max-w-xs"
          @error="($event.target as HTMLAudioElement).style.display = 'none'"
        />
      </div>

      <!-- Iframe Media -->
      <IframePreview
        v-else-if="tokenData?.metadata?.animation_url"
        :src="sanitizeIpfsUrl(tokenData?.metadata?.animation_url)"
        :alt="tokenData?.metadata?.name || 'NFT'"
        @error="($event.target as HTMLIFrameElement).style.display = 'none'"
      />

      <!-- Image Media -->
      <img
        v-else-if="imageStatus === 'normal' && tokenData?.metadata?.image"
        :src="toOriginalContentUrl(sanitizeIpfsUrl(tokenData?.metadata?.image))"
        :alt="tokenData?.metadata?.name || 'NFT'"
        class="aspect-square w-full object-contain"
        @error="imageStatus = 'fallback'"
      >
      <img
        v-else-if="imageStatus === 'fallback' && collectionData?.metadata?.image"
        :src="toOriginalContentUrl(sanitizeIpfsUrl(collectionData?.metadata?.image))"
        :alt="tokenData?.metadata?.name || 'NFT'"
        class="aspect-square w-full object-contain"
      >
      <!-- Fallback -->
      <div
        v-else
        class="aspect-square w-full flex items-center justify-center bg-muted"
      >
        <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
      </div>

      <!-- Fullscreen Back Button -->
      <UButton
        v-if="isFullscreen"
        icon="i-heroicons-chevron-left"
        variant="ghost"
        class="z-20 fixed top-4 left-4 md:top-6 md:left-6"
        @click="toggleFullscreen"
      />

      <!-- Media Toolbar -->
      <GalleryItemToolBar
        v-if="tokenData"
        :nft="tokenData"
        :container-id="containerId"
        :mime-type="mimeType"
        class="
          md:absolute md:bottom-4 md:left-1/2 md:transform md:-translate-x-1/2
          md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-200 md:z-10
          mt-3 md:mt-0
        "
        @toggle-fullscreen="toggleFullscreen"
      />
    </div>
  </div>
</template>
