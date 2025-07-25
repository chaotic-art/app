<script setup lang="ts">
const { hash, error, status, isLoading } = useTransactionModal()

function getProgressValue() {
  switch (status.value) {
    case 'signed': return 25
    case 'broadcasted': return 50
    case 'txBestBlocksState': return 75
    case 'finalized': return 100
    default: return 0
  }
}
</script>

<template>
  <UModal
    v-model:open="isLoading"
    :prevent-close="true"
    :closable="false"
  >
    <template #content>
      <div class="p-8">
        <div class="text-center mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Processing Transaction
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Please wait while your transaction is being processed
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-6">
          <!-- Modern Spinner -->
          <div class="flex flex-col items-center space-y-4">
            <div class="relative">
              <!-- Outer ring -->
              <div class="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
              <!-- Spinning ring -->
              <div class="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin" />
              <!-- Inner pulsing dot -->
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-pulse" />
            </div>

            <!-- Percentage -->
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                {{ getProgressValue() }}%
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Complete
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-2">
            <UProgress
              :value="getProgressValue()"
              color="neutral"
              size="md"
              class="transition-all duration-500 ease-out"
            />
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Processing...</span>
              <span>{{ getProgressValue() }}/100</span>
            </div>
          </div>

          <!-- Transaction Hash -->
          <div v-if="hash" class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
              Transaction Hash
            </div>
            <div class="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
              {{ hash }}
            </div>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="status === 'finalized' && !error" class="text-center space-y-4">
          <div class="flex justify-center">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-check-circle" class="text-3xl text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Transaction Successful
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Your transaction has been completed successfully
            </p>
          </div>
          <div v-if="hash" class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
              Transaction Hash
            </div>
            <div class="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
              {{ hash }}
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center space-y-4">
          <div class="flex justify-center">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="text-3xl text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Transaction Failed
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              There was an error processing your transaction
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded p-2">
              {{ error.message }}
            </p>
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
