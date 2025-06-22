<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'
import { useWalletStore } from '@/stores/wallet'
import { WalletStageTypes, WalletStates } from '@/stores/wallet/types'

const walletStore = useWalletStore()
const { disconnectWallet } = useWalletManager()

const {
  getInstalledWallets: installedWallets,
  getUninstalledWallets: uninstalledWallets,
  getConnectedWallets: lastConnected,
} = storeToRefs(walletStore)

const activeTab = ref('All')

async function processWalletExtensions(extensions: WalletExtension[], connectOnly: boolean): Promise<boolean> {
  const toConnectExtensions = extensions.filter(extension => extension.state !== WalletStates.Connected)

  for (const extension of toConnectExtensions) {
    walletStore.updateWalletState(extension.id, WalletStates.ConnectionQueued)
  }

  if (!connectOnly) {
    const disconnectPromises = extensions
      .filter(extension => extension.state === WalletStates.Connected)
      .map(extension => disconnectWallet(extension))

    await Promise.all(disconnectPromises)
  }

  return Boolean(toConnectExtensions.length)
}

async function onSelectInstalledWallet(extensions: WalletExtension[]) {
  const hasUnconnected = await processWalletExtensions(extensions, false)

  if (hasUnconnected) {
    walletStore.setStage(WalletStageTypes.Authorization)
  }
}

function onLastConnected() {
  for (const extension of lastConnected.value) {
    walletStore.updateWallet(extension.id, { isSelected: true })
  }

  walletStore.setStage(WalletStageTypes.Account)
}

function onSelectUnistalledWallet(wallet: WalletExtension) {
  window.open(wallet.url, '_blank')
}
</script>

<template>
  <div class="space-y-6">
    <WalletSelectionTabs v-model="activeTab" />

    <InstalledWallets
      :extensions="installedWallets"
      :last-connected="lastConnected"
      @select="onSelectInstalledWallet"
      @last-connected="onLastConnected"
    />

    <hr class="my-4 text-gray-200 dark:text-gray-700">

    <UninstalledWallets
      :extensions="uninstalledWallets"
      @select="onSelectUnistalledWallet"
    />
  </div>
</template>
