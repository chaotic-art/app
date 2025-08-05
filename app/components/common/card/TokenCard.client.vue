<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'

const props = defineProps<{
  tokenId: number
  collectionId: number
  chain: Prefix
  image?: string | null
  name?: string | null
}>()

const {
  token,
  owner,
  isLoading,
  error,
  mimeType,
  price,
  usdPrice,
  mediaIcon,
} = useToken(props)
</script>

<template>
  <div class="relative border rounded-xl border-gray-300 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-900 hover:shadow-lg transition-shadow hover-card-effect group">
    <!-- Loading State -->
    <template v-if="isLoading">
      <!-- Image Skeleton -->
      <div class="aspect-square bg-gray-200 dark:bg-neutral-800 animate-pulse flex items-center justify-center">
        <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
      </div>

      <!-- Content Skeleton -->
      <div class="p-3 md:p-4 space-y-3">
        <!-- Title Skeleton -->
        <div class="h-4 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse w-3/4" />

        <!-- Price Skeleton -->
        <div class="flex items-center justify-between">
          <div class="h-3 bg-gray-100 dark:bg-neutral-700 rounded animate-pulse w-1/3" />
        </div>
      </div>
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <div class="aspect-square bg-red-50 dark:bg-red-900 flex items-center justify-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-400 dark:text-red-300" />
      </div>
      <div class="p-3 md:p-4">
        <p class="text-red-600 dark:text-red-300 text-sm font-medium">
          Failed to load NFT
        </p>
      </div>
    </template>

    <!-- Loaded State -->
    <template v-else>
      <NuxtLink :to="`/${chain}/gallery/${collectionId}-${tokenId}`" class="block">
        <!-- NFT Media -->
        <div class="aspect-square bg-gray-200 dark:bg-neutral-800 overflow-hidden relative">
          <video
            v-if="mimeType?.includes('video') && (token?.metadata?.animation_url || token?.metadata?.image)"
            :src="sanitizeIpfsUrl(token?.metadata?.animation_url || token?.metadata?.image)"
            class="w-full h-full object-cover"
            muted
            @error="($event.target as HTMLVideoElement).style.display = 'none'"
          />
          <div
            v-else-if="mimeType?.includes('audio') && (token?.metadata?.animation_url || token?.metadata?.image)"
            class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-900 relative"
          >
            <UIcon name="i-heroicons-musical-note" class="w-16 h-16 text-gray-700 dark:text-gray-200 mb-4" />
            <audio
              :src="sanitizeIpfsUrl(token?.metadata?.animation_url || token?.metadata?.image)"
              controls
              class="w-4/5 max-w-xs"
              @error="($event.target as HTMLAudioElement).style.display = 'none'"
            />
          </div>
          <img
            v-else-if="image || token?.metadata?.image"
            :src="sanitizeIpfsUrl(image || token?.metadata?.image)"
            :alt="token?.metadata?.name || 'NFT'"
            class="w-full h-full object-cover"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          >
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-neutral-700"
          >
            <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
          </div>

          <!-- Media type icon overlay -->
          <div
            v-if="mimeType && (token?.metadata?.animation_url || token?.metadata?.image || image)"
            class="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full shadow-md flex items-center justify-center"
          >
            <UIcon :name="mediaIcon" class="w-3 h-3 text-white" />
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-3 md:p-4">
          <h3 class="font-bold text-base md:text-lg mb-2 text-gray-900 dark:text-white line-clamp-1" :title="name || token?.metadata?.name || 'Untitled NFT'">
            {{ name || token?.metadata?.name || 'Untitled NFT' }}
          </h3>

          <!-- Price Section -->
          <div class="flex items-center justify-between mt-3">
            <div class="flex flex-col gap-1">
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Price
              </div>
              <div class="text-right">
                <div v-if="price" class="flex items-baseline gap-1">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ price }}</span>
                </div>
                <div v-else>
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-300">No price set</span>
                </div>
              </div>
            </div>

            <!-- USD Price -->
            <div class="flex flex-col items-end gap-1">
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                USD
              </div>
              <div class="text-right">
                <div v-if="price" class="flex items-baseline gap-1">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ usdPrice || '$0.00' }}</span>
                </div>
                <div v-else>
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-300">--</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Owner Section -->
          <div class="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-700">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Owner</span>
              <UserInfo
                v-if="owner"
                :address="owner"
                :avatar-size="20"
                :transparent-background="true"
                class="!p-0"
              />
              <span v-else class="text-xs text-gray-600 dark:text-gray-300">N/A</span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </template>
  </div>
</template>
