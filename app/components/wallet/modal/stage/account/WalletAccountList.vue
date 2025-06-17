<script setup lang="ts">
import type { WalletAccount, WalletExtensionAccountPair } from '@/stores/wallet/types.ts'

defineProps<{
  items: WalletExtensionAccountPair[]
}>()

const emit = defineEmits<{
  select: [accountId: string]
}>()

const toast = useToast()

function selectAccount(account: WalletAccount) {
  emit('select', account.id)
}

async function copyAddress(address: string) {
  await navigator.clipboard.writeText(address)
  toast.add({
    title: 'Copied to clipboard',
    description: `Address ${address} copied`,
    color: 'success',
  })
}
</script>

<template>
  <div>
    <WalletAccountListEmpty v-if="items.length === 0" />

    <UCard
      v-for="({ account, extension }) in items"
      :key="account.id"
      class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      :class="{ 'ring-2 ring-primary-500': account.isSelected }"
      :ui="{ body: '!p-2' }"
      @click="selectAccount(account)"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <ProfileAvatar :address="account.address" />
          </div>
          <div class="flex items-start space-x-1">
            <div>
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-1">
                  <div class="w-4 h-4 rounded shadow-lg bg-white flex items-center justify-center relative z-10">
                    <img
                      :src="extension.icon"
                      :alt="extension.name"
                      class="w-3 h-3 object-contain"
                    >
                  </div>
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ account.name }}
                  </div>
                  <UBadge
                    v-if="account.vm === 'EVM'"
                    color="info"
                    size="xs"
                  >
                    EVM
                  </UBadge>
                </div>
                <span class="text-xs text-gray-600 dark:text-gray-400">
                  ${{ account.balance }}
                </span>
              </div>

              <div class="flex justify-between items-center space-x-2">
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ account.address }}
                </div>

                <UButton
                  icon="i-lucide-copy"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  class="opacity-60 hover:opacity-100 transition-opacity"
                  @click.prevent="copyAddress(account.address)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
