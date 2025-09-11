<script setup lang="ts">
import { useTimeoutFn } from '@vueuse/core'
import { FALLBACK_DROP_COLLECTION_MAX } from '@/components/drop/utils'
import useGenerativeIframeData from '@/composables/drop/useGenerativeIframeData'

const { previewItem } = storeToRefs(useDropStore())
const { isCapturingImage, drop } = storeToRefs(useDropStore())

const { imageDataPayload, imageDataLoaded } = useGenerativeIframeData()
const { accountId } = useAuth()

const generativeImageUrl = ref()

const { start: startTimer } = useTimeoutFn(() => {
  // quick fix: ensure that even if the completed event is not received, the loading state of the drop can be cleared
  // only applicable if the drop is missing`kodahash/render/completed` event
  if (!imageDataLoaded.value) {
    isCapturingImage.value = false
  }
}, 5000)

function generateNft() {
  if (!drop.value) {
    return
  }

  isCapturingImage.value = true

  startTimer()

  previewItem.value = generatePreviewItem({
    entropyRange: getEntropyRange(drop.value?.max ?? FALLBACK_DROP_COLLECTION_MAX),
    accountId: accountId.value ?? '',
    content: drop.value.content,
  })

  generativeImageUrl.value = previewItem.value.image
  imageDataPayload.value = undefined
}

watch(imageDataLoaded, (loaded) => {
  if (loaded) {
    isCapturingImage.value = false
  }
})

watch(drop, (drop) => {
  generativeImageUrl.value = drop?.content
}, { once: true })

watch([accountId], () => {
  generateNft()
}, { immediate: true })
</script>

<template>
  <div class="border p-6 rounded-2xl border-border">
    <IframePreview
      :src="sanitizeIpfsUrl(generativeImageUrl)"
      sandbox="allow-scripts allow-same-origin allow-modals"
      allow="accelerometer *; camera *; gyroscope *; microphone *; xr-spatial-tracking *;"
      :base-size="drop.id === 'genweavepatches' ? 128 : 1080"
    />

    <div class="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
      <UButton class="rounded-full bg-accent text-xs md:text-sm cursor-pointer" variant="soft" trailing-icon="i-lucide-refresh-cw" :loading="isCapturingImage" @click="generateNft">
        Preview Variation
      </UButton>
      <!-- <UButton class="rounded-full bg-accent text-xs md:text-sm" variant="soft" trailing-icon="i-lucide-joystick">
        Controls
      </UButton> -->
    </div>
  </div>
</template>
