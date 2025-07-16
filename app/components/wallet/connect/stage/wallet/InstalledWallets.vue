<script setup lang="ts">
defineProps<{
  extensions: WalletExtension[]
  lastConnected: WalletExtension[]
}>()

const emit = defineEmits<{
  select: [extension: WalletExtension[]]
  lastConnected: [extension: WalletExtension[]]
  connectAll: [void]
}>()

const isConnected = (extension: WalletExtension) => extension.state === WalletStates.Connected
</script>

<template>
  <div class="space-y-2">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-gray-900 dark:text-gray-100 capitalize">
          {{ $t('wallet.installedAndRecentlyUsed') }}
        </h3>
      </div>

      <WalletsGrid :extensions @select="item => emit('select', [item])">
        <template v-if="lastConnected.length" #grid>
          <WalletsGridItem @click="$emit('lastConnected', lastConnected)">
            <div class="flex flex-col items-center space-y-3">
              <StackedWallets :wallets="lastConnected" size="sm" />
              <span class="text-xs text-gray-900 dark:text-gray-100">{{ $t('wallet.lastConnected') }}</span>
            </div>
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
              <span>{{ isConnected(item) ? $t('wallet.disconnect') : $t('wallet.connect') }}</span>
              <UIcon :name="isConnected(item) ? 'i-heroicons-link-slash' : 'i-heroicons-chevron-right'" class="w-3 h-3 ml-1" />
            </div>
          </WalletItemContent>
        </template>
      </WalletsGrid>
    </div>

    <WalletsGridItem class="flex justify-between !py-2" @click="emit('connectAll')">
      <span class="text-sm text-gray-900 dark:text-gray-100">{{ $t('wallet.allInstalledWallets') }}</span>

      <div class="flex items-center gap-1 text-blue-500 dark:text-blue-400">
        <span class="text-sm">{{ $t('wallet.connectAll') }}</span>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 ml-1" />
      </div>
    </WalletsGridItem>
  </div>
</template>
