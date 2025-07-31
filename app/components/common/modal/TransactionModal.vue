<script setup lang="ts">
import { sanitizeIpfsUrl } from '~/utils/ipfs'

const { hash, error, status, isLoading, result, isSuccess, close } = useTransactionModal()

function getProgressValue() {
  switch (status.value) {
    case 'start': return 0
    case 'signed': return 25
    case 'broadcasted': return 50
    case 'txBestBlocksState': return 75
    case 'finalized': return 100
    default: return 0
  }
}

function getStatusStep() {
  switch (status.value) {
    case 'signed': return 1
    case 'broadcasted': return 2
    case 'txBestBlocksState': return 3
    case 'finalized': return 4
    default: return 0
  }
}

const steps = [
  { label: 'Signing', icon: 'i-heroicons-pencil-square' },
  { label: 'Broadcasting', icon: 'i-heroicons-radio' },
  { label: 'In Block', icon: 'i-heroicons-cube' },
  { label: 'Finalized', icon: 'i-heroicons-check-circle' },
]
</script>

<template>
  <UModal
    v-model:open="isLoading"
    :prevent-close="!isSuccess && !error"
    :closable="isSuccess || !!error"
    @close="(isSuccess || error) && close()"
  >
    <template #content>
      <!-- TODO: extract success preview component each categories -->
      <!-- success preview -->
      <div v-if="isSuccess && result?.type === 'collection'" class="p-6">
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
            @click="close()"
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

      <!-- NFT success preview -->
      <div v-else-if="isSuccess && result?.type === 'nft'" class="p-6">
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
            @click="close()"
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
            @click="close()"
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

      <!-- Error State -->
      <div v-else-if="error" class="text-center space-y-4 p-6">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-exclamation-triangle" class="text-3xl text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Transaction Failed
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            There was an error processing your transaction
          </p>
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
            <p class="text-xs text-red-700 dark:text-red-400">
              {{ error.message }}
            </p>
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex flex-col sm:flex-row gap-3">
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

      <!-- loading state -->
      <div v-else class="p-6">
        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-6">
          <!-- Header with animated dots -->
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Processing Transaction
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please wait while we process your transaction. This may take a few moments.
            </p>
          </div>

          <!-- Step Indicators -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="(step, index) in steps"
                :key="index"
                class="flex flex-col items-center space-y-2"
              >
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                  :class="[
                    getStatusStep() > index ? 'bg-gray-600 text-white'
                    : getStatusStep() === index + 1 ? 'bg-gray-300 text-gray-700 animate-pulse'
                      : 'bg-gray-200 text-gray-400',
                  ]"
                >
                  <UIcon :name="step.icon" class="text-sm" />
                </div>
                <span
                  class="text-xs text-center transition-colors duration-300"
                  :class="[
                    getStatusStep() > index ? 'text-gray-700 dark:text-gray-300 font-medium'
                    : getStatusStep() === index + 1 ? 'text-gray-600 dark:text-gray-400 font-medium'
                      : 'text-gray-400 dark:text-gray-500',
                  ]"
                >
                  {{ step.label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Progress Card -->
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</span>
              <span class="text-lg font-bold text-gray-800 dark:text-gray-200">{{ getProgressValue() }}%</span>
            </div>
            <UProgress
              :value="getProgressValue()"
              color="neutral"
              size="sm"
              class="mb-2"
            />
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Step {{ getStatusStep() }} of 4
            </div>
          </div>

          <!-- Transaction Hash Card -->
          <div v-if="hash" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div class="flex items-center space-x-2 mb-2">
              <UIcon name="i-heroicons-hashtag" class="text-sm text-gray-400" />
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction Hash</span>
            </div>
            <div class="text-xs font-mono text-gray-700 dark:text-gray-300 break-all bg-gray-50 dark:bg-gray-800 rounded p-2">
              {{ hash }}
            </div>
          </div>
        </div>

        <!-- Default State -->
        <div v-else class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">
            No transaction in progress
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template>
