<script setup lang="ts">
import type { CollectionCategory } from '~/composables/useTransactionModal'
import { sanitizeIpfsUrl } from '~/utils/ipfs'

interface Props {
  result: CollectionCategory
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
        Collection Created Successfully!
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Your collection has been created and is now live on the blockchain
      </p>
    </div>

    <!-- Collection Preview Card - Alternative 1: Minimal Badge Style -->
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
      <div class="flex items-center gap-3">
        <div class="size-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <img
            v-if="sanitizeIpfsUrl(result.image)"
            :src="sanitizeIpfsUrl(result.image)"
            :alt="result.name"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-heroicons-photo" class="text-sm text-gray-400" />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
            {{ result.name }}
          </h4>
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
              {{ result.description }}
            </p>
            <span class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-mono flex-shrink-0">
              #{{ result.id }}
            </span>
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
        :to="`/${result.prefix}/collection/${result.id}`"
        color="neutral"
        variant="solid"
        size="lg"
        class="flex-1 justify-center"
        @click="close"
      >
        <UIcon name="i-heroicons-eye" class="mr-2" />
        View Collection
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        class="flex-1 justify-center"
        @click="close"
      >
        <UIcon name="i-heroicons-x-mark" class="mr-2" />
        Close
      </UButton>
    </div>
  </div>
</template>
