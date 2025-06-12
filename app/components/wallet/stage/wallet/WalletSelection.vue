<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'
import { useSubWalletStore } from '@/stores/subWallet'

const emit = defineEmits(['extensionConnected', 'close'])

const walletExtensions = ref<WalletExtension[]>([])
const activeTab = ref('All')

const subWalletStore = useSubWalletStore()

if (import.meta.client) {
  walletExtensions.value = await getWalletExtensions()
}

const subWallets = computed(() => walletExtensions.value)

const installedSubstrateWallets = computed(() =>
  subWallets.value.filter(wallet => wallet.installed),
)

const uninstalledSubstrateWallets = computed(() =>
  subWallets.value.filter(wallet => !wallet.installed),
)

async function getWalletExtensions(): Promise<WalletExtension[]> {
  const wallets = await subWalletStore.init()

  return wallets.map(extension => ({
    id: extension.id,
    name: extension.name,
    icon: extension.icon,
    connected: extension.enabled,
    url: extension.url,
    source: extension.source,
    installed: extension.installed,
    vm: 'SUB',
  }))
}

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
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex justify-between items-center p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
        Connect Wallet
      </h2>

      <UButton
        variant="ghost"
        color="neutral"
        icon="i-lucide-x"
        size="sm"
        @click="emit('close')"
      />
    </div>

    <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
      <WalletSelectionTabs v-model="activeTab" />

      <InstalledWallets :extensions="installedSubstrateWallets" />

      <hr class="my-4 text-gray-200 dark:text-gray-700">

      <UnistalledWallets :extensions="uninstalledSubstrateWallets" />
    </div>
  </div>
</template>
