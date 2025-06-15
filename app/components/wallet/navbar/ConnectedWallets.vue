<script setup lang="ts">
import { useWalletStore } from '~/stores/wallet'

const { wallets, getIsEvmConnected: evmConnected, getIsSubstrateConnected: subConnected } = storeToRefs(useWalletStore())

const hasConnectedWallet = computed(() => evmConnected.value || subConnected.value)
</script>

<template>
  <div
    v-if="hasConnectedWallet"
    class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
  >
    <ConnectedWalletBadge
      v-if="evmConnected"
      wallet-type="EVM"
      :wallet="wallets.EVM"
    />

    <div
      v-if="evmConnected && subConnected"
      class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-3"
    />

    <ConnectedWalletBadge
      v-if="subConnected"
      wallet-type="SUB"
      :wallet="wallets.SUB"
    />

    <UIcon
      name="i-lucide-chevron-down"
      class="w-4 h-4 ml-2 text-gray-500 dark:text-gray-400"
    />
  </div>
</template>
