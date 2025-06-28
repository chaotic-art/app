<script setup lang="ts">
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
        {{ $t('wallet.connected_count', { count: extensions.length }) }}
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
        {{ $t('wallet.logOut') }}
      </UButton>

      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        @click="$emit('manage')"
      >
        {{ $t('wallet.manageWallets') }}
      </UButton>
    </div>
  </div>
</template>
