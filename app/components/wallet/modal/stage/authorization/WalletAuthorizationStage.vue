<script setup lang="ts">
const walletStore = useWalletStore()
const { wallets } = storeToRefs(walletStore)
const subWalletStore = useSubWalletStore()

const queuedWallets = computed(() => wallets.value.filter(wallet =>
  wallet.state === WalletStates.ConnectionQueued
  || wallet.state === WalletStates.Connecting
  || wallet.state === WalletStates.ConnectionFailed,
))

const currentExtensionId = ref<string | undefined>(queuedWallets.value[0]?.id)
const currentExtension = computed<WalletExtension | undefined>(() => queuedWallets.value.find(wallet => wallet.id === currentExtensionId.value))

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
  onModalOpenChange: (open) => {
    if (!open && currentExtension.value && currentExtension.value.state !== WalletStates.Connected) {
      setWalletConnectionFailed(currentExtension.value)
    }
  },
})

async function initSubAuthorization(extension: WalletExtension): Promise<WalletAccount[]> {
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

function setWalletConnectionFailed(extension: WalletExtension) {
  walletStore.updateWallet(extension.id, {
    state: WalletStates.ConnectionFailed,
    accounts: [],
  })
}

function setWalletConnected(extension: WalletExtension, accounts: WalletAccount[]) {
  // for some reason from extensions return an account more than once
  const uniqueAccounts = accounts.filter((account, index, self) => self.findIndex(a => a.id === account.id) === index)

  walletStore.updateWallet(extension.id, {
    state: WalletStates.Connected,
    accounts: uniqueAccounts,
    isSelected: true,
  })

  currentExtensionId.value = queuedWallets.value[0]?.id
}

async function initEvmAuth() {
  openModal()
}

async function initExtensionAuthorization(extension: WalletExtension) {
  try {
    walletStore.updateWalletState(extension.id, WalletStates.Connecting)

    execByVm({
      SUB: async () => {
        try {
          const walletAccounts = await initSubAuthorization(extension)
          setWalletConnected(extension, walletAccounts)
        }
        catch {
          walletStore.updateWalletState(extension.id, WalletStates.ConnectionFailed)
        }
      },
      EVM: async () => await initEvmAuth(),
    }, { vm: extension.vm })
  }
  catch {
    walletStore.updateWalletState(extension.id, WalletStates.ConnectionFailed)
  }
}

function handleQueue(extension?: WalletExtension) {
  if (!extension) {
    walletStore.setStage(WalletStageTypes.Account)
    return
  }

  if (extension.state !== WalletStates.ConnectionQueued) {
    return
  }

  initExtensionAuthorization(extension)
}

function handleRetry(extension: WalletExtension) {
  walletStore.updateWalletState(extension.id, WalletStates.ConnectionQueued)
  initExtensionAuthorization(extension)
}

watch(currentExtension, handleQueue, { immediate: true })
</script>

<template>
  <WalletAuthorizationLoader
    :current-extension="currentExtension"
    @retry="handleRetry"
  />

  <WalletAccountFooter />
</template>
