<script setup lang="ts">
import type { NftCategory } from '~/composables/useTransactionModal'
import { sanitizeIpfsUrl } from '~/utils/ipfs'

interface Props {
  result: NftCategory
  hash: string
  close: () => void
}

defineProps<Props>()
</script>

<template>
  <div class="p-6">
    <!-- Success Header -->
    <div class="text-center mb-6">
      <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-check-circle" class="text-3xl text-gray-600 dark:text-gray-300" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {{ result.supply > 1 ? `${result.supply} NFTs Created Successfully!` : 'NFT Created Successfully!' }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ result.supply > 1 ? 'Your NFTs have been minted and are now live on the blockchain' : 'Your NFT has been minted and is now live on the blockchain' }}
      </p>
    </div>

    <!-- NFT Preview Card -->
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
      <div class="flex items-start gap-4">
        <!-- NFT Image -->
        <div class="size-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <img
            v-if="sanitizeIpfsUrl(result.image)"
            :src="sanitizeIpfsUrl(result.image)"
            :alt="result.name"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-heroicons-photo" class="text-lg text-gray-400" />
          </div>
        </div>

        <!-- NFT Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2 mb-2">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {{ result.name }}
            </h4>
            <div class="flex flex-col gap-1 flex-shrink-0">
              <span class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-mono">
                Collection #{{ result.collectionId }}
              </span>
            </div>
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {{ result.description }}
          </p>

          <!-- Item IDs -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-hashtag" class="text-xs text-gray-400" />
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">
                {{ result.supply > 1 ? 'Item IDs' : 'Item ID' }}
              </span>
            </div>
            <div class="flex flex-wrap gap-1">
              <template v-if="result.supply <= 5">
                <span
                  v-for="itemId in result.itemIds"
                  :key="itemId"
                  class="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded font-mono"
                >
                  #{{ itemId }}
                </span>
              </template>
              <template v-else>
                <span
                  v-for="itemId in result.itemIds.slice(0, 3)"
                  :key="itemId"
                  class="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded font-mono"
                >
                  #{{ itemId }}
                </span>
                <span class="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                  +{{ result.itemIds.length - 3 }} more
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Details -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div class="flex items-center space-x-2 mb-3">
        <UIcon name="i-heroicons-hashtag" class="text-sm text-gray-400" />
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction Hash</span>
      </div>
      <div class="text-xs font-mono text-gray-700 dark:text-gray-300 break-all bg-gray-50 dark:bg-gray-800 rounded p-3">
        {{ result.hash || hash }}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <UButton
        :to="`/${result.prefix}/gallery/${result.collectionId}-${result.itemIds[0]}`"
        color="neutral"
        variant="solid"
        size="lg"
        class="flex-1 justify-center"
        @click="close"
      >
        <UIcon name="i-heroicons-eye" class="mr-2" />
        {{ result.supply > 1 ? 'View First NFT' : 'View NFT' }}
      </UButton>
      <UButton
        :to="`/${result.prefix}/collection/${result.collectionId}`"
        color="neutral"
        variant="outline"
        size="lg"
        class="flex-1 justify-center"
        @click="close"
      >
        <UIcon name="i-heroicons-rectangle-stack" class="mr-2" />
        View Collection
      </UButton>
      <UButton
        color="neutral"
        variant="ghost"
        size="lg"
        class="sm:w-auto justify-center"
        @click="close"
      >
        <UIcon name="i-heroicons-x-mark" class="mr-2" />
        Close
      </UButton>
    </div>
  </div>
</template>
