<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'
import { WalletStageTypes, WalletStates } from '@/stores/wallet/types'
import { useWalletStore } from '~/stores/wallet'

const activeTab = ref('All')

const walletStore = useWalletStore()
const {
  getInstalledWallets: installedWallets,
  getUninstalledWallets: uninstalledWallets,
  stage,
} = storeToRefs(walletStore)

// const { wallets, getIsEvmConnected, getIsSubstrateConnected } = storeToRefs(walletStore)
// const { wallets: subWallets, initialized } = storeToRefs(subWalletStore)

// const connecting = ref<string | null>(null)

// if (import.meta.client) {
//   await subWalletStore.init()
// }

// const recentlyUsedWallets = computed(() => {
//   const recent = []

//   if (getIsEvmConnected.value) {
//     recent.push({
//       type: 'EVM',
//       name: 'MetaMask',
//       icon: 'i-simple-icons-ethereum',
//       connected: true,
//       lastUsed: true,
//     })
//   }

//   if (getIsSubstrateConnected.value && wallets.value.SUB.account?.extension) {
//     const subWallet = subWallets.value.find(w => w.source === wallets.value.SUB.account?.extension)
//     if (subWallet) {
//       recent.push({
//         type: 'SUB',
//         name: subWallet.name,
//         icon: subWallet.icon,
//         connected: true,
//         lastUsed: true,
//         source: subWallet.source,
//       })
//     }
//   }

//   return recent
// })

// const availableWallets = computed(() => {
//   const walletList = []

//   // Add EVM wallets
//   if (activeTab.value === 'ALL' || activeTab.value === 'EVM') {
//     walletList.push({
//       type: 'EVM',
//       name: 'MetaMask',
//       description: 'MetaMask, WalletConnect, and more',
//       icon: 'i-simple-icons-ethereum',
//       connected: getIsEvmConnected.value,
//       installed: true,
//     })
//   }

//   // Add Substrate wallets
//   if (activeTab.value === 'ALL' || activeTab.value === 'SUB') {
//     installedSubstrateWallets.value.forEach((wallet) => {
//       walletList.push({
//         type: 'SUB',
//         name: wallet.name,
//         description: wallet.accounts ? `${wallet.accounts.length} account${wallet.accounts.length !== 1 ? 's' : ''}` : 'Ready to connect',
//         icon: wallet.icon,
//         connected: getIsSubstrateConnected.value && wallets.value.SUB.account?.extension === wallet.source,
//         installed: true,
//         source: wallet.source,
//       })
//     })
//   }

//   return walletList
// })

// const otherWallets = computed(() => {
//   if (activeTab.value === 'SUB' || activeTab.value === 'ALL') {
//     return uninstalledSubstrateWallets.value.map(wallet => ({
//       type: 'SUB',
//       name: wallet.name,
//       description: 'Not installed',
//       icon: wallet.icon,
//       connected: false,
//       installed: false,
//       url: wallet.url,
//       source: wallet.source,
//     }))
//   }
//   return []
// })

// async function connectEvmWallet() {
//   if (connecting.value === 'EVM')
//     return

//   connecting.value = 'EVM'
//   try {
//     // Trigger EVM wallet connection (this will be handled by the existing EVM wallet logic)
//     // For now, we'll just emit the event to go to account selection
//     // The actual connection will be handled in the account selection phase
//     emit('extensionConnected', 'EVM')
//   }
//   catch (error) {
//     console.error('Failed to connect EVM wallet:', error)
//   }
//   finally {
//     connecting.value = null
//   }
// }

// async function connectSubstrateWallet(source: string) {
//   if (connecting.value === source)
//     return

//   connecting.value = source
//   try {
//     await subWalletStore.connectWallet(source as any)

//     const walletData = subWallets.value.find(w => w.source === source)
//     if (walletData?.accounts && walletData.accounts.length > 0) {
//       emit('extensionConnected', 'SUB')
//     }
//   }
//   catch (error) {
//     console.error('Failed to connect Substrate wallet:', error)
//   }
//   finally {
//     connecting.value = null
//   }
// }

// function disconnectWallet(type: string, source?: string) {
//   if (type === 'EVM') {
//     walletStore.disconnect('EVM')
//   }
//   else if (type === 'SUB') {
//     walletStore.disconnect('SUB')
//     if (source) {
//       subWalletStore.disconnectWallet(source as any)
//     }
//   }
// }

// function handleWalletAction(wallet: any) {
//   if (wallet.connected) {
//     emit('extensionConnected', wallet.type)
//   }
//   else {
//     if (wallet.type === 'EVM') {
//       connectEvmWallet()
//     }
//     else {
//       connectSubstrateWallet(wallet.source)
//     }
//   }
// }

// function connectAllWallets() {
//   availableWallets.value.forEach((wallet) => {
//     if (!wallet.connected && wallet.installed) {
//       handleWalletAction(wallet)
//     }
//   })
// }
//

function onSelectInstalledWallet(extension: WalletExtension) {
  walletStore.updateWalletState(extension.id, WalletStates.ConnectionQueued)
  stage.value = WalletStageTypes.Authorization
}

function onSelectUnistalledWallet(wallet: WalletExtension) {
  window.open(wallet.url, '_blank')
}
</script>

<template>
  <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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
