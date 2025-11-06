<script setup lang="ts">
interface Props {
  chain: string
  estimatedFee: string
  walletAddress: string
  walletBalance: string
  remainsBalance: string
  title: string
  items: {
    name: string
    image: string
  }[]
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
        <div class="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
          <UserInfo
            :address="walletAddress"
            :size="40" transparent-background custom-name
          >
            <template #name="{ addressName }">
              <div class="flex flex-col">
                <span class="text-sm font-medium">
                  Signing with <span class="font-bold">{{ addressName }}</span>
                </span>
                <span class="text-xs text-gray-600 dark:text-gray-400">
                  <span class="font-bold">{{ walletBalance }}</span> on {{ chain }}
                </span>
              </div>
            </template>
          </UserInfo>
        </div>

        <!-- Simulated Result -->
        <div class="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 space-y-3">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
            Simulated Result - {{ title }}
          </div>

          <!-- Sent -->
          <div class="flex items-center justify-between text-red-600">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-arrow-up" class="w-4 h-4" />
              <span class="text-sm ">Sent</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium">
                {{ estimatedFee }}
              </div>
            </div>
          </div>

          <!-- Received -->
          <div class="text-green-600">
            <!-- Items display -->
            <div v-if="items.length > 0" :class="items.length > 1 ? 'space-y-2' : ''">
              <div
                v-for="(item, index) in items.slice(0, 3)"
                :key="index"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-arrow-down" class="w-4 h-4 " />
                  <span class="text-sm font-medium">Received</span>
                </div>

                <div class="text-right flex items-center gap-2">
                  <div class="size-10 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      v-if="item.image"
                      :src="item.image"
                      :alt="item.name || 'Item'"
                      class="w-full h-full object-cover"
                    >
                    <div v-else class="w-full h-full bg-gray-300 flex items-center justify-center">
                      <UIcon name="i-heroicons-photo" class="w-3 h-3 text-gray-500" />
                    </div>
                  </div>
                  <span class="text-sm font-medium">
                    {{ item.name || (items.length === 1 ? 'Item Created' : `Item ${index + 1}`) }}
                  </span>
                </div>
              </div>

              <!-- Show +N indicator if there are more than 3 items -->
              <div v-if="items.length > 3" class="flex items-center justify-between ">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-arrow-down" class="w-4 h-4 " />
                  <span class="text-sm font-medium">Received</span>
                </div>
                <div class="text-right flex items-center gap-2">
                  <span class="text-sm font-medium">
                    +{{ items.length - 3 }} more items
                  </span>
                </div>
              </div>
            </div>

            <!-- No items fallback -->
            <div v-else class="flex items-center gap-2">
              <UIcon name="i-heroicons-arrow-down" class="w-4 h-4 text-gray-400" />
              <span class="text-sm font-medium">received</span>
              <UIcon name="i-heroicons-arrow-down" class="w-4 h-4 text-gray-400" />
              <div class="w-6 h-6 rounded-lg overflow-hidden bg-gray-100">
                <div class="w-full h-full bg-gray-300 flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="w-3 h-3 text-gray-500" />
                </div>
              </div>
              <span class="text-sm font-medium">Item Created</span>
            </div>
          </div>

          <!-- Chain -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-200">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Chain</span>
            </div>
            <span class="text-sm">{{ chain }}</span>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
          <!-- Estimated Fee -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">Fee</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium font-mono">
                {{ estimatedFee }}
              </div>
            </div>
          </div>

          <!-- wallet balance -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">Balance</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium font-mono">
                {{ walletBalance }}
              </div>
            </div>
          </div>

          <USeparator class="my-2" />

          <!-- remains balance -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">Remains Balance</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium font-mono">
                {{ remainsBalance }}
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
