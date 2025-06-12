<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'

defineProps<{
  extensions: WalletExtension[]
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-gray-900 dark:text-gray-300 capitalize">
        Installed & recently used
      </h3>
    </div>

    <WalletsGrid :extensions>
      <template #grid>
        <WalletsGridItem>
          Last Connected
        </WalletsGridItem>
      </template>

      <template #default="{ item }">
        <!-- Connected Dot -->
        <div class="absolute top-2 left-2 w-1 h-1 bg-green-500 dark:bg-green-500 rounded-full" />

        <!-- Amount of Accounts -->
        <div class="absolute top-1 right-1 px-1.5 py-0.5 text-white bg-black bg-opacity-25 border border-cyan-100 border-opacity-12 rounded text-xs font-semibold">
          +1
        </div>

        <WalletItemContent :extension="item">
          <div class="font-medium text-xs text-blue-500 dark:text-blue-400 flex items-center">
            <span>Connect</span>
            <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 ml-1" />
          </div>
        </WalletItemContent>
      </template>
    </WalletsGrid>
  </div>
</template>
