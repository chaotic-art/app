<script setup lang="ts">
import type { WalletAccount, WalletExtension } from '@/stores/wallet/types'
import { useSubWalletStore } from '@/stores/subWallet'
import { useWalletStore } from '@/stores/wallet'
import { WalletStageTypes, WalletStates } from '@/stores/wallet/types'
import WalletAuthorizationLoader from './WalletAuthorizationLoader.vue'

const walletStore = useWalletStore()
const { wallets } = storeToRefs(walletStore)
const subWalletStore = useSubWalletStore()

const queuedWallets = computed(() => wallets.value.filter(wallet => wallet.state === WalletStates.ConnectionQueued))

const currentExtension = ref<WalletExtension | undefined>(queuedWallets.value[0])

const { openModal } = useReown({
  onAccountChange: ({ account, wallet }) => {
    const { allAccounts: accounts } = account
    const extension = currentExtension.value

    if (!extension) {
      return
    }

    setWalletConnected(extension, accounts.map(account => ({
      id: `${extension.id}:${wallet.rdns}/${account.address}`,
      vm: 'EVM',
      address: account.address,
      isSelected: false,
      icon: wallet.icon,
    })))
  },
})

async function initSubAuthorization(extension: WalletExtension): Promise<WalletAccount[]> {
  await subWalletStore.init()

  const subWalletAccounts = await subWalletStore.connectWallet(extension.source as any)

  const walletAccounts: WalletAccount[] = subWalletAccounts.map(account => ({
    id: `${extension.id}:${account.address}`,
    vm: 'SUB',
    address: account.address,
    isSelected: false,
    name: account.name,
  }))

  return walletAccounts
}

function setWalletConnected(extension: WalletExtension, accounts: WalletAccount[]) {
  walletStore.updateWallet(extension.id, {
    accounts,
    state: WalletStates.Connected,
    isSelected: true,
  })

  currentExtension.value = queuedWallets.value[0]
}

async function initEvmAuth() {
  openModal()
}

async function initExtensionAuthorization(extension: WalletExtension) {
  try {
    walletStore.updateWalletState(extension.id, WalletStates.Connecting)

    execByVm({
      SUB: async () => {
        const walletAccounts = await initSubAuthorization(extension)
        setWalletConnected(extension, walletAccounts)
      },
      EVM: async () => await initEvmAuth(),
    }, { vm: extension.vm })
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

  initExtensionAuthorization(extension)
}

watch(currentExtension, handleQueue, { immediate: true })
</script>

<template>
  <WalletAuthorizationLoader :current-extension="currentExtension" />
</template>
