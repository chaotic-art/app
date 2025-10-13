<script setup lang="ts">
import type { ChainVM } from '@kodadot1/static'

const ACTIVE_TAB_VM_MAP: Record<string, ChainVM> = {
  Polkadot: 'SUB',
  EVM: 'EVM',
}

const walletStore = useWalletStore()
const { disconnectWallet } = useWalletManager()

const {
  getInstalledWallets: installedWallets,
  getUninstalledWallets: uninstalledWallets,
  getConnectedWallets: lastConnected,
} = storeToRefs(walletStore)

const activeTab = ref('All')

const filteredInstalledWallets = computed(() => {
  // if (activeTab.value === 'All') {
  //   return installedWallets.value
  // }
  return installedWallets.value.filter(wallet => wallet.vm === ACTIVE_TAB_VM_MAP.Polkadot)
})

async function processWalletExtensions(extensions: WalletExtension[], connectOnly: boolean): Promise<boolean> {
  const otherExtensions = installedWallets.value.filter(wallet => !extensions.some(ext => ext.id === wallet.id) && wallet.state !== WalletStates.Connected && wallet.state !== WalletStates.Disconnected)

  for (const extension of otherExtensions) {
    walletStore.updateWalletState(extension.id, WalletStates.Idle)
  }

  const toConnectExtensions = extensions.filter(extension => extension.state !== WalletStates.Connected)

  for (const extension of toConnectExtensions) {
    walletStore.updateWalletState(extension.id, WalletStates.AuthorizationQueued)
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

function onConnectAll() {
  for (const extension of filteredInstalledWallets.value) {
    if (extension.state !== WalletStates.Connected) {
      walletStore.updateWalletState(extension.id, WalletStates.AuthorizationQueued)
    }
    else {
      walletStore.updateWallet(extension.id, { isSelected: true })
    }
  }

  walletStore.setStage(WalletStageTypes.Authorization)
}

function onSelectUnistalledWallet(wallet: WalletExtension) {
  window.open(wallet.url, '_blank')
}
</script>

<template>
  <div class="space-y-6">
    <!-- <WalletSelectionTabs v-model="activeTab" /> -->

    <InstalledWallets
      :extensions="filteredInstalledWallets"
      :last-connected="lastConnected"
      @select="onSelectInstalledWallet"
      @last-connected="onLastConnected"
      @connect-all="onConnectAll"
    />

    <template v-if="activeTab === 'All' || activeTab === 'Polkadot'">
      <hr class="my-4 text-gray-200 dark:text-gray-700">

      <UninstalledWallets
        :extensions="uninstalledWallets"
        @select="onSelectUnistalledWallet"
      />
    </template>
  </div>
</template>
