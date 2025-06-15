<script setup lang="ts">
import type { WalletAccount, WalletExtension } from '@/stores/wallet/types'
import { useWalletStore } from '@/stores/wallet'
import { WalletStageTypes, WalletStates } from '@/stores/wallet/types'
import { useSubWalletStore } from '~/stores/subWallet'

const walletStore = useWalletStore()
const { wallets } = storeToRefs(walletStore)
const subWalletStore = useSubWalletStore()

const queuedWallets = computed(() => wallets.value.filter(wallet => wallet.state === WalletStates.ConnectionQueued))

const currentExtension = computed(() => queuedWallets.value[0])

async function initSubAuthorization(extension: WalletExtension): Promise<WalletAccount[]> {
  await subWalletStore.init()

  const subWalletAccounts = await subWalletStore.connectWallet(extension.source as any)

  const walletAccounts: WalletAccount[] = subWalletAccounts.map(account => ({
    vm: 'SUB',
    address: account.address,
    isSelected: false,
    name: account.name || '', // TODO allow undefined or namse as address shortended
    balance: 0,
    icon: '',
  }))

  return walletAccounts
}

async function initAuthorization(extension: WalletExtension) {
  try {
    walletStore.updateWalletState(extension.id, WalletStates.Connecting)

    let walletAccounts: WalletAccount[] = []

    if (extension.vm === 'SUB') {
      walletAccounts = await initSubAuthorization(extension)
    }
    else if (extension.vm === 'EVM') {
      // TODO
    }

    walletStore.updateWalletAccounts(extension.id, walletAccounts)
    walletStore.updateWalletState(extension.id, WalletStates.Connected)
  }
  catch (error) {
    walletStore.updateWalletState(extension.id, WalletStates.ConnectionFailed)
  }
}

function handleQueue(extension?: WalletExtension) {
  if (!extension) {
    walletStore.setStage(WalletStageTypes.Account)
    return
  }

  initAuthorization(extension)
}

watch(currentExtension, handleQueue, { immediate: true })
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 space-y-6">
    <div class="relative">
      <div class="absolute inset-0 w-24 h-24 border-4 border-blue-500 rounded-full pulse-ring" />
      <div class="absolute inset-0 w-24 h-24 border-4 border-blue-400 rounded-full pulse-ring-delayed" />

      <div class="w-24 h-24 rounded-full overflow-hidden shadow-lg bg-white flex items-center justify-center relative z-10">
        <img
          :src="currentExtension?.icon"
          :alt="`${currentExtension?.name} Wallet Extension`"
          class="w-16 h-16 object-contain"
        >
      </div>
    </div>

    <div class="text-center space-y-2">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Waiting for authorization
      </h1>
      <h2 class="text-lg text-gray-600 dark:text-gray-300 font-medium">
        Please connect your wallet extension to Chaotic
      </h2>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.pulse-ring {
  animation: pulse-ring 2s ease-out infinite;
}

.pulse-ring-delayed {
  animation: pulse-ring 2s ease-out infinite;
  animation-delay: 0.7s;
}
</style>
