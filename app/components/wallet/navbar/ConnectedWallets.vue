<script setup lang="ts">
import { useWalletStore } from '~/stores/wallet'

const { getConnectedEvmAccount, getConnectedSubAccount } = storeToRefs(useWalletStore())

const connectedWallet = computed(() => getConnectedSubAccount.value || getConnectedEvmAccount.value)
</script>

<template>
  <div
    v-if="connectedWallet"
    class="flex items-center bg-primary hover:bg-primary/90 rounded-full py-1 pl-2 pr-3 transition-colors cursor-pointer"
  >
    <ConnectedWalletBadge :account="connectedWallet" />
  </div>
</template>
