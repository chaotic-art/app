<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'
import { useWalletStore } from '@/stores/wallet'
import { WalletStageTypes, WalletStates } from '@/stores/wallet/types'

const walletStore = useWalletStore()
const {
  getInstalledWallets: installedWallets,
  getUninstalledWallets: uninstalledWallets,
  stage,
} = storeToRefs(walletStore)

const activeTab = ref('All')

function onSelectInstalledWallet(extension: WalletExtension) {
  walletStore.updateWalletState(extension.id, WalletStates.ConnectionQueued)
  stage.value = WalletStageTypes.Authorization
}

function onSelectUnistalledWallet(wallet: WalletExtension) {
  window.open(wallet.url, '_blank')
}
</script>

<template>
  <div class="space-y-6 max-h-[70vh] overflow-y-auto">
    <WalletSelectionTabs v-model="activeTab" />

    <InstalledWallets
      :extensions="installedWallets"
      @select="onSelectInstalledWallet"
    />

    <hr class="my-4 text-gray-200 dark:text-gray-700">

    <UninstalledWallets
      :extensions="uninstalledWallets"
      @select="onSelectUnistalledWallet"
    />
  </div>
</template>
