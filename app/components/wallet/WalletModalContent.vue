<script setup lang="ts">
import type { SetWalletParams } from '@/stores/wallet'
import type { ChainVM } from '@kodadot1/static'

const emit = defineEmits(['select', 'disconnect', 'close'])

const StageTypes = {
  WALLET: 'wallet',
  ACCOUNT: 'account',
} as const

type StageType = typeof StageTypes[keyof typeof StageTypes]

const stage = ref<StageType>(StageTypes.WALLET)
const connectedWalletType = ref<ChainVM | null>(null)

function onExtensionConnected(walletType: ChainVM) {
  connectedWalletType.value = walletType
  stage.value = StageTypes.ACCOUNT
}

function onAccountSelected(params: SetWalletParams) {
  emit('select', params)
  emit('close')
}

function goBackToExtensionSelection() {
  stage.value = StageTypes.WALLET
  connectedWalletType.value = null
}

function closeModal() {
  emit('close')
}
</script>

<template>
  <div>
    <WalletSelection
      v-if="stage === StageTypes.WALLET"
      @extension-connected="onExtensionConnected"
      @close="closeModal"
    />

    <AccountSelection
      v-else-if="stage === StageTypes.ACCOUNT && connectedWalletType"
      :wallet-type="connectedWalletType"
      @select-account="onAccountSelected"
      @back="goBackToExtensionSelection"
      @close="closeModal"
    />
  </div>
</template>
