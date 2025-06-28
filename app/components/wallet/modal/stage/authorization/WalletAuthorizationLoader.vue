<script setup lang="ts">
defineProps<{
  currentExtension?: WalletExtension
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 space-y-6">
    <div class="relative">
      <div class="absolute inset-0 w-24 h-24 border-4 border-blue-500 rounded-full pulse-ring" />
      <div class="absolute inset-0 w-24 h-24 border-4 border-blue-400 rounded-full pulse-ring-delayed" />

      <div class="w-24 h-24 rounded-full overflow-hidden shadow-lg bg-white flex items-center justify-center relative z-10">
        <img
          :src="currentExtension?.icon"
          :alt="`${currentExtension?.name} Wallet Extension`"
          class="w-16 h-16 object-contain"
        >
      </div>
    </div>

    <div class="text-center space-y-2">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ $t('wallet.waitingForAuthorization') }}
      </h1>
      <h2 class="text-lg text-gray-600 dark:text-gray-300 font-medium">
        {{ $t('wallet.pleaseConnectWalletExtensionToChaotic') }}
      </h2>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.pulse-ring {
  animation: pulse-ring 2s ease-out infinite;
}

.pulse-ring-delayed {
  animation: pulse-ring 2s ease-out infinite;
  animation-delay: 0.7s;
}
</style>
