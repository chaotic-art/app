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

// Expose functions and state for parent component
defineExpose({
  generateNft,
  isCapturingImage,
  previewItem,
})
</script>

<template>
  <div class="border p-2 rounded-xl border-border">
    <IframePreview
      :src="sanitizeIpfsUrl(generativeImageUrl)"
      sandbox="allow-scripts allow-same-origin allow-modals"
      allow="accelerometer *; camera *; gyroscope *; microphone *; xr-spatial-tracking *;"
    />
  </div>
</template>
