<script setup lang="ts">
interface TransactionDetails {
  from: string
  to: string
  amount: string
  chain: string
  estimatedFee: string
  estimatedTime: string
}

interface Props {
  transaction: TransactionDetails
  walletAddress: string
  walletBalance: string
  collectionName?: string
  collectionImage?: string
}

defineProps<Props>()
const emit = defineEmits<{ close: [boolean] }>()

function handleConfirm() {
  emit('close', true)
}

function handleCancel() {
  emit('close', false)
}
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    class="max-w-md"
    title="Confirm Transaction"
  >
    <template #body>
      <!-- Content -->
      <div class="space-y-4">
        <!-- Signing Account -->
        <div class="bg-gray-50 rounded-lg p-4">
          <UserInfo
            :address="walletAddress"
            :size="40" transparent-background custom-name
          >
            <template #name="{ addressName }">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900">
                  Signing with <span class="font-bold">{{ addressName }}</span>
                </span>
                <span class="text-xs text-gray-500">
                  <span class="font-bold">{{ walletBalance }}</span> on {{ transaction.chain }}
                </span>
              </div>
            </template>
          </UserInfo>
        </div>

        <!-- Simulated Result -->
        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
          <div class="text-sm font-medium text-gray-700 mb-3">
            Simulated Result
          </div>

          <!-- Sent -->
          <div class="flex items-center justify-between text-red-600">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-arrow-up" class="w-4 h-4" />
              <span class="text-sm ">Sent</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium">
                {{ transaction.amount }}
              </div>
            </div>
          </div>

          <!-- Received -->
          <div class="flex items-center justify-between text-green-600">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-arrow-down" class="w-4 h-4" />
              <span class="text-sm ">Received</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                <img
                  v-if="collectionImage"
                  :src="collectionImage"
                  :alt="collectionName || 'Collection'"
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full bg-gray-300 flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="w-4 h-4 text-gray-500" />
                </div>
              </div>
              <span class="text-sm font-medium">
                {{ collectionName || 'Collection Created' }}
              </span>
            </div>
          </div>

          <!-- Chain -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-200">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 text-gray-500" />
              <span class="text-sm text-gray-600">Chain</span>
            </div>
            <span class="text-sm text-gray-900">{{ transaction.chain }}</span>
          </div>
        </div>

        <!-- Estimated Fee -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4 text-gray-500" />
              <span class="text-sm text-gray-600">Estimated Fee</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">
                {{ transaction.estimatedFee }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton
        variant="outline"
        color="neutral"
        class="flex-1"
        @click="handleCancel"
      >
        Cancel
      </UButton>
      <UButton
        color="neutral"
        class="flex-1"
        @click="handleConfirm"
      >
        <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 mr-2" />
        Sign
      </UButton>
    </template>
  </UModal>
</template>
