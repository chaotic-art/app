<script setup lang="ts">
import { useTimeoutFn } from '@vueuse/core'
import { FALLBACK_DROP_COLLECTION_MAX } from '@/components/drop/utils'
import useGenerativeIframeData from '@/composables/drop/useGenerativeIframeData'

const { previewItem } = storeToRefs(useDropStore())
const { isCapturingImage, drop } = storeToRefs(useDropStore())

const { imageDataPayload, imageDataLoaded } = useGenerativeIframeData()
const { accountId } = useAuth()

const generativeImageUrl = ref()

// Calculate minting percentage
const mintingPercentage = computed(() => {
  if (!drop.value?.max || !drop.value?.minted)
    return 0
  return Math.round((Number(drop.value.minted) / Number(drop.value.max)) * 100)
})

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
  <div class="rounded-xl border border-border overflow-hidden relative group">
    <iframe
      class="aspect-square w-full"
      :src="sanitizeIpfsUrl(generativeImageUrl)"
      frameborder="0"
      sandbox="allow-scripts allow-same-origin allow-modals"
      allow="accelerometer *; camera *; gyroscope *; microphone *; xr-spatial-tracking *;"
    />

    <!-- Preview Variation Button - shows on hover -->
    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
      <UButton class="bg-accent text-xs md:text-sm cursor-pointer" variant="soft" trailing-icon="i-lucide-refresh-cw" :loading="isCapturingImage" @click="generateNft">
        Preview Variation
      </UButton>
    </div>
  </div>

  <!-- Minting Progress -->
  <div class="mt-6 bg-card border border-border rounded-xl p-4">
    <div class="flex items-center justify-between text-sm mb-3 text-card-foreground">
      <span>{{ drop?.minted || 0 }} / {{ drop?.max || 10000 }} minted</span>
      <span>{{ mintingPercentage }}%</span>
    </div>
    <div class="w-full bg-secondary rounded-full h-2">
      <div
        class="bg-primary rounded-full h-2 transition-all duration-300"
        :style="{ width: `${mintingPercentage}%` }"
      />
    </div>
  </div>
</template>
