<script setup lang="ts">
import type { SetWalletParams } from '@/stores/wallet'
import type { ChainVM } from '@kodadot1/static'

const emit = defineEmits(['select', 'disconnect', 'close'])

const currentPhase = ref<'extension' | 'account'>('extension')
const connectedWalletType = ref<ChainVM | null>(null)

function onExtensionConnected(walletType: ChainVM) {
  connectedWalletType.value = walletType
  currentPhase.value = 'account'
}

function onAccountSelected(params: SetWalletParams) {
  emit('select', params)
  emit('close')
}

function goBackToExtensionSelection() {
  currentPhase.value = 'extension'
  connectedWalletType.value = null
}

function closeModal() {
  emit('close')
}
</script>

<template>
  <div>
    <ExtensionSelection
      v-if="currentPhase === 'extension'"
      @extension-connected="onExtensionConnected"
      @close="closeModal"
    />

    <AccountSelection
      v-else-if="currentPhase === 'account' && connectedWalletType"
      :wallet-type="connectedWalletType"
      @select-account="onAccountSelected"
      @back="goBackToExtensionSelection"
      @close="closeModal"
    />
  </div>
</template>
