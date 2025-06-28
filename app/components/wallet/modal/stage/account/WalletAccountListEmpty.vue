<script setup lang="ts">
</script>

<template>
  <div class="text-center py-8">
    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <UIcon name="i-lucide-user" class="w-8 h-8 text-gray-400" />
    </div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
      {{ $t('wallet.noAccountsFound') }}
    </h3>
    <p class="text-gray-500 dark:text-gray-400 text-sm">
      {{ $t('wallet.tryAdjustingSearchOrConnectMoreWallets') }}
    </p>
  </div>
</template>
