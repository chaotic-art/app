<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'

defineProps<{
  extensions: WalletExtension[]
}>()
defineEmits(['manage', 'logout'])
</script>

<template>
  <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
    <div class="flex items-center space-x-3">
      <StackedWallets :wallets="extensions" :max-visible="2" size="sm" />

      <div class="text-sm text-gray-600 dark:text-gray-400 capitalize">
        {{ extensions.length }} connected
      </div>
    </div>

    <div class="flex items-center space-x-2">
      <UButton
        color="error"
        variant="soft"
        size="sm"
        icon="i-lucide-log-out"
        @click="$emit('logout')"
      >
        Log out
      </UButton>

      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        @click="$emit('manage')"
      >
        Manage wallets
      </UButton>
    </div>
  </div>
</template>
