<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { useFullscreen } from '@vueuse/core'
import { shortenAddress } from '@/utils/format/address'
import { MediaType, resolveMedia } from '@/utils/gallery/media'

const CONTAINER_ID = 'nft-img-container'

const { token, chain } = useRoute().params
const [collectionId, tokenId] = token?.toString().split('-') ?? []

const fullScreenDisabled = ref(false)
const mediaItemRef = ref<HTMLDivElement & { toggleFullscreen: () => void } | null>(null)
const { toggle, isFullscreen, isSupported } = useFullscreen(mediaItemRef)

// Use the existing useToken composable
const {
  token: tokenData,
  owner,
  isLoading,
  error,
  mimeType,
  price: formattedPrice,
  usdPrice,
  mediaIcon,
} = useToken({
  tokenId: Number(tokenId),
  collectionId: Number(collectionId),
  chain: chain as Prefix,
})

function toggleMediaFullscreen() {
  if (!isSupported.value || fullScreenDisabled.value) {
    return
  }
  toggle().catch(() => {
    fullScreenDisabled.value = true
  })
}

function toggleFullscreen() {
  if (!mimeType.value) {
    toggleMediaFullscreen()
    return
  }

  const mediaType = resolveMedia(mimeType.value)
  if ([MediaType.VIDEO].includes(mediaType)) {
    mediaItemRef.value?.toggleFullscreen()
  }
  else {
    toggleMediaFullscreen()
  }
}
</script>

<template>
  <UContainer class="px-4 md:px-6 py-4 md:py-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
      <!-- Media Skeleton -->
      <div class="order-2 lg:order-1">
        <div class="relative border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 p-4">
          <div class="aspect-square bg-gray-200 dark:bg-neutral-800 rounded-xl animate-pulse flex items-center justify-center">
            <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
          </div>
          <!-- Toolbar skeleton -->
          <div class="flex items-center justify-between mt-4">
            <div class="flex items-center gap-2">
              <USkeleton class="w-8 h-8 rounded-full" />
              <USkeleton class="w-8 h-8 rounded-full" />
            </div>
            <USkeleton class="w-8 h-8 rounded-full" />
          </div>
        </div>
      </div>

      <!-- Details Skeleton -->
      <div class="order-1 lg:order-2 space-y-6">
        <!-- Title skeleton -->
        <USkeleton class="h-16 w-full" />

        <!-- Owner section skeleton -->
        <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 bg-white dark:bg-neutral-900">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <USkeleton class="w-12 h-12 rounded-full" />
              <div class="space-y-2">
                <USkeleton class="h-3 w-16" />
                <USkeleton class="h-4 w-32" />
              </div>
            </div>
            <USkeleton class="h-10 w-24 rounded-full" />
          </div>
        </div>

        <!-- Description skeleton -->
        <div class="space-y-2">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-3/4" />
          <USkeleton class="h-4 w-1/2" />
        </div>

        <!-- Price section skeleton -->
        <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 bg-white dark:bg-neutral-900">
          <div class="flex items-center justify-between mb-4">
            <div class="space-y-2">
              <USkeleton class="h-8 w-32" />
              <USkeleton class="h-4 w-20" />
            </div>
            <div class="space-y-2">
              <USkeleton class="h-4 w-8" />
              <USkeleton class="h-6 w-16" />
            </div>
          </div>
          <div class="flex gap-2">
            <USkeleton class="h-10 w-24 rounded-full" />
            <USkeleton class="h-10 w-24 rounded-full" />
          </div>
        </div>

        <!-- Token info skeleton -->
        <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 bg-white dark:bg-neutral-900 space-y-3">
          <div class="flex justify-between items-center">
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-4 w-16" />
          </div>
          <div class="flex justify-between items-center">
            <USkeleton class="h-4 w-20" />
            <USkeleton class="h-4 w-12" />
          </div>
          <div class="flex justify-between items-center">
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
      <div class="order-2 lg:order-1">
        <div class="relative border border-red-200 dark:border-red-800 rounded-2xl overflow-hidden bg-red-50 dark:bg-red-900/20 p-4">
          <div class="aspect-square bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-400" />
          </div>
        </div>
      </div>
      <div class="order-1 lg:order-2">
        <div class="text-center lg:text-left">
          <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
            Failed to Load NFT
          </h1>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            There was an error loading this NFT. Please try again later.
          </p>
          <UButton variant="outline" class="rounded-full" @click="$router.go(-1)">
            Go Back
          </UButton>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
      <!-- Media Section -->
      <div class="">
        <div class="relative border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 p-3 md:p-4 hover:shadow-lg transition-shadow">
          <div
            :id="CONTAINER_ID"
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
            :container-id="CONTAINER_ID"
            class="mt-3 md:mt-4"
            @toggle-fullscreen="toggleFullscreen"
          />
        </div>
      </div>

      <!-- Details Section -->
      <div class="space-y-4 md:space-y-6">
        <!-- Title -->
        <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white text-center lg:text-left leading-tight">
          {{ tokenData?.metadata?.name || 'Untitled NFT' }}
        </h1>

        <!-- Owner Section -->
        <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-3 md:p-4 bg-white dark:bg-neutral-900">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-1 bg-gray-100 dark:bg-neutral-800 rounded-full">
                <UserInfo :avatar-size="40" :address="owner || undefined" />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                  Owner
                </p>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ owner ? shortenAddress(owner) : 'Unknown' }}
                </p>
              </div>
            </div>
            <FollowButton
              v-if="owner"
              :target="owner"
              class="rounded-full"
            />
          </div>
        </div>

        <!-- Description -->
        <div v-if="tokenData?.metadata?.description" class="space-y-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Description
          </h3>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ tokenData.metadata.description }}
          </p>
        </div>

        <!-- Price Section -->
        <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-3 md:p-4 bg-white dark:bg-neutral-900">
          <div class="flex items-center justify-between mb-3 md:mb-4">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                Price
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ formattedPrice || 'Not for sale' }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                USD
              </p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ formattedPrice ? (usdPrice || '$0.00') : '--' }}
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <UButton
              v-if="formattedPrice"
              class="rounded-full flex-1"
              color="primary"
              size="lg"
            >
              Buy Now
            </UButton>
            <UButton
              class="rounded-full flex-1"
              variant="outline"
              size="lg"
            >
              Make Offer
            </UButton>
          </div>
        </div>

        <!-- Token Information -->
        <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-3 md:p-4 bg-white dark:bg-neutral-900">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
            Token Information
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Collection ID</span>
              <NuxtLink
                :to="`/${chain}/collection/${collectionId}`"
                class="text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                {{ collectionId }}
              </NuxtLink>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Token ID</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ tokenId }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Chain</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white capitalize">{{ chain }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
