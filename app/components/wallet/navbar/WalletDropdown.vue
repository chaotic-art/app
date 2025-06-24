<script setup lang="ts">
import { useWalletStore } from '~/stores/wallet'

const emit = defineEmits(['open'])

const { getIsEvmConnected, getIsSubstrateConnected } = storeToRefs(useWalletStore())

function openWalletModal() {
  emit('open')
}
</script>

<template>
  <div>
    <UButton
      v-if="!getIsEvmConnected && !getIsSubstrateConnected"
      :label="$t('wallet.connect')"
      variant="solid"
      class="text-white rounded-full px-6 text-base cursor-pointer"
      @click="openWalletModal"
    />

    <div
      v-else
      class="cursor-pointer"
      @click="openWalletModal"
    >
      <ConnectedWallets />
    </div>
  </div>
</template>
