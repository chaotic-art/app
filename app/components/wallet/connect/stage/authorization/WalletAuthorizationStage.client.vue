<script setup lang="ts">
import type { EvmWalletAccount } from '@/utils/wallet'
import { useConnect, useConnections, useConnectors } from '@wagmi/vue'
import { formatEvmAccounts, formatSubAccounts } from '@/utils/wallet'
import { chainsForWagmi } from '~/utils/viem'

const walletStore = useWalletStore()
const { wallets } = storeToRefs(walletStore)
const subWalletStore = useSubWalletStore()
const connectors = useConnectors()
const connections = useConnections()
const { mutateAsync: connectAsync } = useConnect()

const queuedWallets = computed(() => wallets.value.filter(wallet =>
  wallet.state === WalletStates.AuthorizationQueued
  || wallet.state === WalletStates.Authorizing
  || wallet.state === WalletStates.AuthorizationFailed,
))

const currentExtensionId = ref<string | undefined>(queuedWallets.value[0]?.id)
const currentExtension = computed<WalletExtension | undefined>(() => queuedWallets.value.find(wallet => wallet.id === currentExtensionId.value))

async function initSubAuthorization(extension: WalletExtension): Promise<WalletAccount[]> {
  const { accounts } = await subWalletStore.connectWallet(extension.source as any)

  return formatSubAccounts({ extension, accounts })
}

function setWalletConnectionFailed(extension: WalletExtension) {
  walletStore.updateWallet(extension.id, {
    state: WalletStates.AuthorizationFailed,
    accounts: [],
  })
}

function setWalletAuthorized(extension: WalletExtension, accounts?: WalletAccount[]) {
  const toUpdate = {
    state: WalletStates.Authorized,
    isSelected: true,
  }

  if (accounts) {
    // for some reason from extensions return an account more than once
    const uniqueAccounts = accounts.filter((account, index, self) => self.findIndex(a => a.id === account.id) === index)

    Object.assign(toUpdate, { accounts: uniqueAccounts })
  }

  walletStore.updateWallet(extension.id, toUpdate)

  currentExtensionId.value = queuedWallets.value[0]?.id
}

function setWalletConnected(extension: WalletExtension, accounts: WalletAccount[]) {
  walletStore.updateWallet(extension.id, {
    accounts,
    isSelected: true,
    state: WalletStates.Connected,
  })

  currentExtensionId.value = queuedWallets.value[0]?.id
}

async function initEvmAuthorization(extension: WalletExtension) {
  const connector = connectors.value.find(connector => connector.id === extension.id)
  const liveConnection = connections.value.find(connection => connection.connector.id === extension.id)

  if (!connector) {
    setWalletConnectionFailed(extension)
    return
  }

  let accounts: EvmWalletAccount[] = []

  if (!liveConnection) {
    const connectedData = await connectAsync({
      chainId: chainsForWagmi[0]?.id,
      connector,
    })

    accounts = connectedData.accounts.map(address => ({ address }))
  }
  else {
    accounts = liveConnection.accounts.map(address => ({ address }))
  }

  setWalletConnected(extension, formatEvmAccounts({
    accounts,
    extension,
  }))
}

async function initExtensionAuthorization(extension: WalletExtension) {
  try {
    walletStore.updateWalletState(extension.id, WalletStates.Authorizing)

    if (extension.vm === 'SUB') {
      try {
        const walletAccounts = await initSubAuthorization(extension)
        setWalletAuthorized(extension, walletAccounts)
      }
      catch {
        walletStore.updateWalletState(extension.id, WalletStates.AuthorizationFailed)
      }
    }
    else {
      await initEvmAuthorization(extension)
    }
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

watch(currentExtension, (extension) => {
  handleQueue(extension)
}, { immediate: true })
</script>

<template>
  <WalletAuthorizationLoader
    :current-extension="currentExtension"
    @retry="handleRetry"
  />

  <WalletAccountFooter />
</template>
