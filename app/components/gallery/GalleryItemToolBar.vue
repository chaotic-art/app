<script setup lang="ts">
import type { OdaToken } from '@/services/oda'
import { downloadImage } from '@/utils/download'
import { isMobileDevice } from '@/utils/environment'
import {
  determineElementType,
  MediaType,
  mediaTypeElementSelectors,
  resolveMedia,
} from '@/utils/gallery/media'
import { sanitizeIpfsUrl, toOriginalContentUrl } from '@/utils/ipfs'
import { onKodahashRenderCompleted } from '@/utils/kodahash'

type ReloadElement
  = | HTMLIFrameElement
    | HTMLVideoElement
    | HTMLImageElement
    | null

const props = defineProps<{
  containerId: string
  nft: OdaToken
}>()

defineEmits(['toggleFullscreen'])

// const { getNft: nft, getNftImage: nftImage, getNftMetadata: nftMetadata, getNftMimeType: nftMimeType, getNftAnimation: nftAnimation, getNftAnimationMimeType: nftAnimationMimeType } = storeToRefs(useNftStore())

const nftImageUrl = computed(() => sanitizeIpfsUrl(props.nft.metadata.image))
const nftAnimation = computed(() => sanitizeIpfsUrl(props.nft.metadata.animation_url))
const nftMimeType = computed(() => props.nft.metadata.mime_type)
const nftAnimationMimeType = computed(() => props.nft.metadata.animation_mime_type)

const isLoading = ref(false)
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
    downloadImage(imageUrl, props.nft.metadata.name)
  }
  catch (error) {
    console.warn('[ERR] unable to fetch image', error)
    toast.add({ title: $i18n.t('toast.downloadError') })
  }
}

const mediaAndImageType = computed(() => {
  const animationMediaType = resolveMedia(nftAnimationMimeType.value)
  const imageMediaType = resolveMedia(nftMimeType.value)
  return { animationMediaType, imageMediaType }
})

function getElementSelector({
  imageMediaType,
  animationMediaType,
}: {
  imageMediaType: MediaType | undefined
  animationMediaType: MediaType | undefined
}) {
  const elementType = determineElementType(animationMediaType!, imageMediaType!)
  return mediaTypeElementSelectors[elementType as keyof typeof mediaTypeElementSelectors]
}

function reloadElement(selector: string) {
  setTimeout(() => {
    isLoading.value = false
    const element: ReloadElement = document.querySelector(selector)

    if (!element) {
      return
    }
    if (mediaTypeElementSelectors[MediaType.IMAGE] === selector) {
      const timestamp = new Date().getTime()
      const url = new URL(element.src)
      url.searchParams.set('t', timestamp.toString())
      element.src = url.toString()
    }
    else {
      element.src += ''
    }
  }, 500)
}

function handleReloadClick() {
  isLoading.value = true
  const { animationMediaType, imageMediaType } = mediaAndImageType.value

  return reloadElement(
    getElementSelector({ animationMediaType, imageMediaType }),
  )
}

function openInNewTab(selector: string, attribute: string = 'src') {
  const element = document.querySelector(`#${props.containerId} ${selector}`)
  if (element) {
    const src = element.getAttribute(attribute)
    if (src) {
      window.open(src, '_blank')
      return true
    }
  }
  return false
}

function handleNewTab() {
  const { animationMediaType, imageMediaType } = mediaAndImageType.value
  const elementSelector = getElementSelector({
    animationMediaType,
    imageMediaType,
  })

  if (!openInNewTab(elementSelector)) {
    window.open(nftAnimation.value || nftImageUrl.value, '_blank')
  }
}

const disableNewTab = computed(() => {
  if (nftAnimation.value && nftAnimationMimeType.value) {
    return true
  }

  return nftImageUrl.value && nftMimeType.value
})

onKodahashRenderCompleted(({ payload }) => imageData.value = payload.image)
</script>

<template>
  <div
    class="w-full mt-6 px-6 py-3 h-11 rounded-[43px] gap-8 flex justify-center border border-gray-400"
  >
    <UTooltip
      text="Reload"
      :popper="{ placement: 'top' }"
    >
      <span>
        <UIcon
          :name="isLoading ? 'i-mdi:loading' : 'i-mdi:arrow-u-left-top'"
          class="h-5 w-5 hover:cursor-pointer"
          :class="{ 'animate-spin': isLoading }"
          @click="handleReloadClick"
        />
      </span>
    </UTooltip>
    <UTooltip
      text="Fullscreen"
      :popper="{ placement: 'top' }"
    >
      <span>
        <UIcon
          name="i-mdi:arrow-top-right-bottom-left"
          class="h-5 w-5 hover:cursor-pointer"
          @click="$emit('toggleFullscreen')"
        />
      </span>
    </UTooltip>
    <UTooltip
      text="Open in New Tab"
      :popper="{ placement: 'top' }"
    >
      <span>
        <UIcon
          v-if="disableNewTab"
          name="i-mdi:arrow-top-right"
          class="h-5 w-5 hover:cursor-pointer"
          @click="handleNewTab"
        />
        <UIcon
          v-else
          name="i-mdi:arrow-top-right"
          class="h-5 w-5 text-k-grey"
        />
      </span>
    </UTooltip>
    <UTooltip
      v-if="isDownloadEnabled"
      text="Download"
      :popper="{ placement: 'top' }"
    >
      <span>
        <UIcon
          name="i-mdi:arrow-collapse-down"
          class="h-5 w-5 hover:cursor-pointer"
          @click="downloadMedia"
        />
      </span>
    </UTooltip>
  </div>
</template>
