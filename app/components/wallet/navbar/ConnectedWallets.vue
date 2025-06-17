<script setup lang="ts">
import { useWalletStore } from '~/stores/wallet'

const { getIsEvmConnected: evmConnected, getIsSubstrateConnected: subConnected, getConnectedEvmAccount, getConnectedSubAccount } = storeToRefs(useWalletStore())

const hasConnectedWallet = computed(() => evmConnected.value || subConnected.value)
</script>

<template>
  <div
    v-if="hasConnectedWallet"
    class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
  >
    <ConnectedWalletBadge
      v-if="evmConnected"
      :account="getConnectedEvmAccount!"
    />

    <div
      v-if="evmConnected && subConnected"
      class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-3"
    />

    <ConnectedWalletBadge
      v-if="subConnected"
      :account="getConnectedSubAccount!"
    />

    <UIcon
      name="i-lucide-chevron-down"
      class="w-4 h-4 ml-2 text-gray-500 dark:text-gray-400"
    />
  </div>
</template>
