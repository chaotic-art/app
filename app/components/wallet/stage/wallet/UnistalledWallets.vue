<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'
import { WalletsGrid } from '#components'

defineProps<{
  extensions: WalletExtension[]
}>()

const showOtherWallets = ref(false)
</script>

<template>
  <div v-if="extensions.length > 0">
    <UButton
      variant="ghost"
      color="neutral"
      size="sm"
      block
      class="justify-between"
      @click="showOtherWallets = !showOtherWallets"
    >
      <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
        Other wallets
      </span>
      <UIcon
        :name="showOtherWallets ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="w-4 h-4"
      />
    </UButton>

    <WalletsGrid v-if="showOtherWallets" v-slot="{ item }" class="mt-3" :extensions="extensions">
      <WalletItemContent :extension="item">
        <div class="font-medium text-xs text-blue-500 dark:text-blue-400 flex items-center">
          <span>Download</span>
          <UIcon name="i-heroicons-arrow-down-tray" class="w-3 h-3 ml-1" />
        </div>
      </WalletItemContent>
    </WalletsGrid>
  </div>
</template>
