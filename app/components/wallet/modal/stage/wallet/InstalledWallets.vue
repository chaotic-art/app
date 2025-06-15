<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'
import { WalletStates } from '@/stores/wallet/types'

defineProps<{
  extensions: WalletExtension[]
}>()

const emit = defineEmits<{
  select: [extension: WalletExtension]
}>()

const isConnected = (extension: WalletExtension) => extension.state === WalletStates.Connected
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-gray-900 dark:text-gray-300 capitalize">
        Installed & recently used
      </h3>
    </div>

    <WalletsGrid :extensions @select="item => emit('select', item)">
      <template #grid>
        <WalletsGridItem>
          <!-- TODO -->
          Last Connected
        </WalletsGridItem>
      </template>

      <template #default="{ item }">
        <template v-if="isConnected(item)">
          <div class="absolute top-2 left-2 w-1 h-1 bg-green-500 dark:bg-green-500 rounded-full" />

          <div class="absolute top-1 right-1 px-1.5 py-0.5 text-white bg-black bg-opacity-25 border border-cyan-100 border-opacity-12 rounded text-xs font-semibold">
            +{{ item.accounts.length }}
          </div>
        </template>

        <WalletItemContent :extension="item">
          <div class="font-medium text-xs flex items-center" :class="isConnected(item) ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'">
            <span>{{ isConnected(item) ? 'Disconnect' : 'Connect' }}</span>
            <UIcon :name="isConnected(item) ? 'i-heroicons-x-mark' : 'i-heroicons-chevron-right'" class="w-3 h-3 ml-1" />
          </div>
        </WalletItemContent>
      </template>
    </WalletsGrid>
  </div>
</template>
