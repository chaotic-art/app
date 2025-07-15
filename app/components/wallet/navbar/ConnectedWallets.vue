<script setup lang="ts">
import { useWalletStore } from '~/stores/wallet'

const { getConnectedEvmAccount, getConnectedSubAccount } = storeToRefs(useWalletStore())

const connectedWallet = computed(() => getConnectedSubAccount.value || getConnectedEvmAccount.value)
</script>

<template>
  <div
    v-if="connectedWallet"
    class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
  >
    <ConnectedWalletBadge :account="connectedWallet" />
  </div>
</template>
