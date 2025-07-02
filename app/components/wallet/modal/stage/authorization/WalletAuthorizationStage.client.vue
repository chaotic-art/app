<script setup lang="ts">
const walletStore = useWalletStore()
const { wallets } = storeToRefs(walletStore)
const subWalletStore = useSubWalletStore()
const walletManager = useWalletManager()

const queuedWallets = computed(() => wallets.value.filter(wallet =>
  wallet.state === WalletStates.AuthorizationQueued
  || wallet.state === WalletStates.Authorizing
  || wallet.state === WalletStates.AuthorizationFailed,
))

const currentExtensionId = ref<string | undefined>(queuedWallets.value[0]?.id)
const currentExtension = computed<WalletExtension | undefined>(() => queuedWallets.value.find(wallet => wallet.id === currentExtensionId.value))

const { openModal } = useReown({
  onAccountChange: (params) => {
    const extension = currentExtension.value

    if (!extension) {
      return
    }

    const accounts = walletManager.formatEvmAccounts({ extension, ...params })

    setWalletAuthorized(extension, accounts)
  },
  onModalOpenChange: (open) => {
    if (!open && currentExtension.value && currentExtension.value.state !== WalletStates.Connected) {
      setWalletConnectionFailed(currentExtension.value)
    }
  },
})

async function initSubAuthorization(extension: WalletExtension): Promise<WalletAccount[]> {
  const accounts = await subWalletStore.connectWallet(extension.source as any)

  return walletManager.formatSubAccounts({ extension, accounts })
}

function setWalletConnectionFailed(extension: WalletExtension) {
  walletStore.updateWallet(extension.id, {
    state: WalletStates.AuthorizationFailed,
    accounts: [],
  })
}

function setWalletAuthorized(extension: WalletExtension, accounts: WalletAccount[]) {
  // for some reason from extensions return an account more than once
  const uniqueAccounts = accounts.filter((account, index, self) => self.findIndex(a => a.id === account.id) === index)

  walletStore.updateWallet(extension.id, {
    state: WalletStates.Authorized,
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
    walletStore.updateWalletState(extension.id, WalletStates.Authorizing)

    execByVm({
      SUB: async () => {
        try {
          const walletAccounts = await initSubAuthorization(extension)
          setWalletAuthorized(extension, walletAccounts)
        }
        catch {
          walletStore.updateWalletState(extension.id, WalletStates.AuthorizationFailed)
        }
      },
      EVM: async () => await initEvmAuth(),
    }, { vm: extension.vm })
  }
  catch {
    walletStore.updateWalletState(extension.id, WalletStates.AuthorizationFailed)
  }
}

function handleQueue(extension?: WalletExtension) {
  if (!extension) {
    walletStore.setStage(WalletStageTypes.Account)
    return
  }

  if (extension.state !== WalletStates.AuthorizationQueued) {
    return
  }

  initExtensionAuthorization(extension)
}

function handleRetry(extension: WalletExtension) {
  walletStore.updateWalletState(extension.id, WalletStates.AuthorizationQueued)

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
