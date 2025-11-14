<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

defineProps<{
  chain: AssetHubChain
  image?: string | null
  name?: string | null
  to?: string
  owner?: string | null
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
        <h3 class="font-bold text-base md:text-lg text-gray-900 dark:text-white" :title="name || ''">
          {{ name }}
        </h3>
      </div>

      <div class="p-3 md:p-4">
        <!-- Owner Section -->
        <div class="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-700">
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Owner</span>
            <UserInfo
              v-if="owner"
              :address="owner || ''"
              :avatar-size="20"
              :transparent-background="true"
              class="p-0!"
            />
            <span v-else class="text-xs text-gray-600 dark:text-gray-300">N/A</span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
