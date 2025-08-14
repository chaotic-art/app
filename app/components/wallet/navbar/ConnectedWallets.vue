<script setup lang="ts">
import { useWalletStore } from '~/stores/wallet'

const { getConnectedEvmAccount, getConnectedSubAccount } = storeToRefs(useWalletStore())

const connectedWallet = computed(() => getConnectedSubAccount.value || getConnectedEvmAccount.value)
</script>

<template>
  <div
    v-if="connectedWallet"
    class="flex items-center bg-primary hover:bg-primary/90 rounded-full py-2 px-4 transition-colors cursor-pointer"
  >
    <ConnectedWalletBadge :account="connectedWallet" />
  </div>
</template>
