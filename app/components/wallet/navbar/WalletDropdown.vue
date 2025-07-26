<script setup lang="ts">
import { useWalletStore } from '~/stores/wallet'

defineEmits(['openWallet', 'openAsset'])

const { getIsEvmConnected, getIsSubstrateConnected } = storeToRefs(useWalletStore())
</script>

<template>
  <div>
    <UButton
      v-if="!getIsEvmConnected && !getIsSubstrateConnected"
      :label="$t('wallet.connect')"
      variant="solid"
      class="text-white rounded-full px-6 text-base cursor-pointer dark:bg-gray-800"
      @click="$emit('openWallet')"
    />

    <div
      v-else
      class="cursor-pointer"
      @click="$emit('openAsset')"
    >
      <ConnectedWallets />
    </div>
  </div>
</template>
