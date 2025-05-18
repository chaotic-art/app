<script setup lang="ts">
const walletStore = useWalletStore()
const { wallets } = storeToRefs(walletStore)

const evmConnected = computed(() => wallets.value.EVM.connected && wallets.value.EVM.account)
const subConnected = computed(() => wallets.value.SUB.connected && wallets.value.SUB.account)

const hasConnectedWallet = computed(() => evmConnected.value || subConnected.value)
</script>

<template>
  <div
    v-if="hasConnectedWallet"
    class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full py-1 px-3"
  >
    <WalletConnectedWalletBadge
      v-if="evmConnected"
      wallet-type="EVM"
      :wallet="wallets.EVM"
    />

    <div
      v-if="evmConnected && subConnected"
      class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"
    />

    <WalletConnectedWalletBadge
      v-if="subConnected"
      wallet-type="SUB"
      :wallet="wallets.SUB"
    />
  </div>
</template>
