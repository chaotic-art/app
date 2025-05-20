<script setup lang="ts">
const { wallets, getIsEvmConnected: evmConnected, getIsSubstrateConnected: subConnected } = storeToRefs(useWalletStore())

const hasConnectedWallet = computed(() => evmConnected.value || subConnected.value)
</script>

<template>
  <div
    v-if="hasConnectedWallet"
    class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full py-1 px-3"
  >
    <ConnectedWalletBadge
      v-if="evmConnected"
      wallet-type="EVM"
      :wallet="wallets.EVM"
    />

    <div
      v-if="evmConnected && subConnected"
      class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"
    />

    <ConnectedWalletBadge
      v-if="subConnected"
      wallet-type="SUB"
      :wallet="wallets.SUB"
    />
  </div>
</template>
