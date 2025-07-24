<script setup lang="ts">
import type { OdaToken } from '~/services/oda'
import { useFullscreen } from '@vueuse/core'
import { MediaType, resolveMedia } from '@/utils/gallery/media'

interface Props {
  tokenData?: OdaToken
  mimeType?: string
  mediaIcon: string
  containerId: string
}

const props = defineProps<Props>()

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
  <div class="relative border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 p-3 md:p-4 hover:shadow-lg transition-shadow">
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
        class="aspect-square w-full object-cover rounded-xl"
        controls
        muted
        @error="($event.target as HTMLVideoElement).style.display = 'none'"
      />

      <!-- Audio Media -->
      <div
        v-else-if="mimeType?.includes('audio') && (tokenData?.metadata?.animation_url || tokenData?.metadata?.image)"
        class="aspect-square w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-900 rounded-xl relative p-4 md:p-6"
      >
        <UIcon name="i-heroicons-musical-note" class="w-12 h-12 md:w-16 md:h-16 text-gray-700 dark:text-gray-200 mb-3 md:mb-4" />
        <audio
          :src="sanitizeIpfsUrl(tokenData?.metadata?.animation_url || tokenData?.metadata?.image)"
          controls
          class="w-full max-w-xs"
          @error="($event.target as HTMLAudioElement).style.display = 'none'"
        />
      </div>

      <!-- Iframe Media -->
      <iframe
        v-else-if="tokenData?.metadata?.animation_url"
        :src="sanitizeIpfsUrl(tokenData?.metadata?.animation_url)"
        :alt="tokenData?.metadata?.name || 'NFT'"
        class="aspect-square w-full rounded-xl"
        @error="($event.target as HTMLIFrameElement).style.display = 'none'"
      />

      <!-- Image Media -->
      <img
        v-else-if="tokenData?.metadata?.image"
        :src="sanitizeIpfsUrl(tokenData?.metadata?.image)"
        :alt="tokenData?.metadata?.name || 'NFT'"
        class="aspect-square w-full object-cover rounded-xl"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      >

      <!-- Fallback -->
      <div
        v-else
        class="aspect-square w-full flex items-center justify-center bg-gray-100 dark:bg-neutral-700 rounded-xl"
      >
        <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
      </div>

      <!-- Media type icon overlay -->
      <div
        v-if="tokenData?.metadata?.animation_url || tokenData?.metadata?.image"
        class="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full shadow-md flex items-center justify-center"
      >
        <UIcon :name="mediaIcon" class="w-3 h-3 text-white" />
      </div>

      <!-- Fullscreen Back Button -->
      <ButtonConfig
        v-if="isFullscreen"
        :button="{
          label: 'Go Back',
          icon: 'i-heroicons-chevron-left',
          variant: 'ghost',
          classes: 'z-20 fixed top-4 left-4 md:top-6 md:left-6',
          onClick: toggleFullscreen,
        }"
      />
    </div>

    <!-- Media Toolbar -->
    <GalleryItemToolBar
      v-if="tokenData"
      :nft="tokenData"
      :container-id="containerId"
      class="mt-3 md:mt-4"
      @toggle-fullscreen="toggleFullscreen"
    />
  </div>
</template>
