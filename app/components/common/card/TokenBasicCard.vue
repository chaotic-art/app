<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

defineProps<{
  chain: AssetHubChain
  image?: string | null
  name?: string | null
  to?: string
}>()
</script>

<template>
  <div
    class="relative border border-gray-300 dark:border-neutral-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow hover-card-effect group"
  >
    <NuxtLink :to="to" class="block">
      <!-- NFT Media -->
      <div class="aspect-square bg-gray-200 dark:bg-neutral-800 overflow-hidden relative group/media">
        <img
          v-if="image"
          :src="sanitizeIpfsUrl(image)"
          :alt="name || ''"
          class="w-full h-full object-contain"
        >
      </div>

      <!-- Card Content -->
      <div class="p-3 md:p-4">
        <h3 class="font-bold text-base md:text-lg mb-2 text-gray-900 dark:text-white line-clamp-1" :title="name || ''">
          {{ name }}
        </h3>
      </div>
    </NuxtLink>
  </div>
</template>
