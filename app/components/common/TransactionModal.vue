<script setup lang="ts">
interface ResolvedError {
  title: string
  description: string
  details?: string
}

const { $i18n } = useNuxtApp()
const { error, result, isSuccess, status, open, close } = useTransactionModal()

const resolvedStatus = computed(() => {
  if (status.value === 'broadcasted') {
    return TransactionStatus.Broadcast
  }

  if (status.value === 'signed') {
    return TransactionStatus.Casting
  }

  if (status.value === 'txBestBlocksState') {
    return TransactionStatus.Block
  }

  if (status.value === 'finalized') {
    return TransactionStatus.Finalized
  }

  return TransactionStatus.Unknown
})

const resolvedError = computed<ResolvedError | null>(() => {
  if (!error.value) {
    return null
  }

  switch (error.value.kind) {
    case 'insufficient_funds':
      return {
        title: $i18n.t('transactionModal.error.insufficientFunds.title'),
        description: $i18n.t('transactionModal.error.insufficientFunds.description'),
      }
    case 'cancelled':
      return {
        title: $i18n.t('transactionModal.error.cancelled.title'),
        description: $i18n.t('transactionModal.error.cancelled.description'),
      }
    default:
      return {
        title: $i18n.t('transactionModal.error.generic.title'),
        description: $i18n.t('transactionModal.error.generic.description'),
        details: error.value.details,
      }
  }
})
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isSuccess ? 'Success' : 'Sign Transaction'"
    :dismissible="!open"
    :close="isSuccess || !!error"
    :ui="{
      content: 'max-w-md w-full',
    }"
    @after:leave="close"
  >
    <template #body>
      <LazySuccessCollection
        v-if="isSuccess && result?.type === 'collection'"
        :result="result"
        :status="resolvedStatus"
      />

      <!-- NFT success preview -->
      <LazySuccessNft
        v-else-if="isSuccess && result?.type === 'nft'"
        :result="result"
        :status="resolvedStatus"
      />

      <!-- Listing success preview -->
      <LazySuccessfulListing
        v-else-if="isSuccess && result?.type === 'listing'"
        :result="result"
        :status="resolvedStatus"
      />

      <!-- Shopping success preview -->
      <LazySuccessfulBuy
        v-else-if="isSuccess && (result?.type === 'buy' || result?.type === 'burn' || result?.type === 'token_transfer' || result?.type === 'airdrop')"
        :result="result"
        :status="resolvedStatus"
      />

      <!-- Transfer success preview -->
      <LazySuccessfulTransfer
        v-else-if="isSuccess && result?.type === 'transfer'"
        :result="result"
        :status="resolvedStatus"
      />

      <!-- Collection destroy success preview -->
      <div v-else-if="isSuccess && result?.type === 'collection_destroy'" class="text-center space-y-4">
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-check" class="text-3xl text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Collection Destroyed Successfully
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            The collection has been permanently destroyed
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center space-y-4">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-exclamation-triangle" class="text-3xl text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {{ resolvedError?.title }}
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {{ resolvedError?.description }}
          </p>
          <div
            v-if="resolvedError?.details"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
          >
            <p class="text-xs text-red-700 dark:text-red-400">
              {{ resolvedError.details }}
            </p>
          </div>
        </div>
      </div>

      <!-- loading state -->
      <LazySigningModalBody
        v-else
        title="Processing Transaction"
        subtitle="Please wait . . ."
        :status="resolvedStatus"
      />
    </template>
  </UModal>
</template>
