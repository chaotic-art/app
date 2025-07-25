<script setup lang="ts">
const { hash, error, status, isLoading } = useTransactionModal()

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
    :prevent-close="true"
    :closable="false"
  >
    <template #content>
      <div class="p-6">
        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-6">
          <!-- Header with animated dots -->
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Processing Transaction
            </h3>
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

        <!-- Success State -->
        <div v-else-if="status === 'finalized' && !error" class="text-center space-y-4">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <UIcon name="i-heroicons-check-circle" class="text-3xl text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Transaction Successful
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Your transaction has been completed successfully
            </p>
          </div>
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

        <!-- Error State -->
        <div v-else-if="error" class="text-center space-y-4">
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
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p class="text-xs text-red-700 dark:text-red-400">
                {{ error.message }}
              </p>
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
