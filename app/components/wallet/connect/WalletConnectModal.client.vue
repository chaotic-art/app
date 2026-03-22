<script setup lang="ts">
import type { SubstrateWalletSource } from '@/utils/wallet/substrate/types'
import { whenever } from '@vueuse/core'
import { useConnection, useConnectors } from '@wagmi/vue'
import { formatEvmAccounts, formatSubAccounts } from '@/utils/wallet'

const emit = defineEmits(['close'])
const isModalOpen = defineModel<boolean>({ required: true })

const { t } = useI18n()
const accountStore = useAccountStore()
const subWalletStore = useSubWalletStore()
const walletStore = useWalletStore()
const walletManager = useWalletManager()
const connection = useConnection()
const connectors = useConnectors()

const { stage, wallets } = storeToRefs(walletStore)
const currentEvmConnection = computed(() => {
  if (!connection.connector.value || !connection.addresses.value?.length) {
    return
  }

  return {
    accounts: connection.addresses.value,
    connector: connection.connector.value,
  }
})

const walletStates = computed<Record<string, WalletState>>(() => {
  return wallets.value.reduce((acc, wallet) => {
    Object.assign(acc, { [wallet.id]: wallet.state })
    return acc
  }, {})
})

const title = computed(() => {
  if (stage.value === WalletStageTypes.Wallet) {
    return t('wallet.selectWallet')
  }
  else if (stage.value === WalletStageTypes.Account) {
    return t('wallet.selectAccount')
  }
  return ''
})

async function init() {
  walletStore.setStage(WalletStageTypes.Loading)

  wallets.value = getWalletExtensions()

  // start wallet watchers only after updating current wallets
  initWalletWatchers()

  walletStore.setStage(WalletStageTypes.Wallet)
}

function watchForSubWalletStoreAccountsChanges() {
  watch(
    () => subWalletStore.wallets.map(wallet => ({ id: wallet.id, accounts: wallet.accounts })),
    (newWallets, oldWallets) => {
      newWallets.forEach((newWallet, index) => {
        const oldWallet = oldWallets?.[index]

        if (!oldWallet || JSON.stringify(newWallet.accounts) !== JSON.stringify(oldWallet.accounts)) {
          const extension = wallets.value.find(wallet => wallet.id === newWallet.id)

          if (extension) {
            walletStore.updateWallet(extension.id, {
              accounts: formatSubAccounts({
                accounts: newWallet.accounts,
                extension,
              }),
            })
          }
        }
      })
    },
    { deep: true },
  )
}

function initWalletWatchers() {
  // sub
  watchForAuthorizedSubWallets()
  watchForSubWalletStoreAccountsChanges()

  // evm
  watchForEvmConnectionsChanges()
}

function getSubWalletExtensions(): WalletExtension[] {
  const wallets = subWalletStore.init()

  return wallets.map(extension => ({
    id: extension.id,
    name: extension.name,
    icon: extension.icon,
    url: extension.url,
    source: extension.source,
    installed: extension.installed,
    vm: 'SUB',
    accounts: [],
    state: WalletStates.Idle,
  }))
}

function getEvmWalletExtensions(): WalletExtension[] {
  const evmConnectors = connectors.value.filter(connector => connector.type === 'injected')
  const discoveredConnectors = evmConnectors.filter(connector => connector.id !== 'injected')
  const visibleConnectors = discoveredConnectors.length ? discoveredConnectors : evmConnectors

  return visibleConnectors.map(connector => ({
    id: connector.id,
    name: connector.name,
    icon: connector.icon ?? '/partners/logo-evm.svg',
    url: '',
    source: connector.id,
    installed: true,
    vm: 'EVM',
    accounts: [],
    state: WalletStates.Idle,
  }))
}

function getWalletExtensions(): WalletExtension[] {
  const subExtensions = getSubWalletExtensions()
  const evmExtensions = getEvmWalletExtensions()

  const freshWallets = [
    ...subExtensions,
    ...evmExtensions,
  ]

  return freshWallets.map((wallet) => {
    const prevWallet = wallets.value.find(w => w.id === wallet.id)

    if (!prevWallet) {
      return wallet
    }

    let state: WalletState = WalletStates.Idle

    // if the wallet was previously connected, change the state to authorized to trigger entire connection process
    if (prevWallet.state === WalletStates.Connected || walletStore.isWalletAccountSelected(wallet)) {
      state = WalletStates.Authorized
    }

    return {
      ...wallet,
      accounts: prevWallet.accounts, // start with old accounts
      state,
    }
  })
}

async function connectSubWallet(wallet: WalletExtension) {
  walletStore.updateWallet(wallet.id, { state: WalletStates.Connecting })

  // if the wallet is authorized via authorization stage, it should already be initialized no need to connect
  // if the page just loaded and the wallet was previously connected, we need to connect again, to fully initialize it
  if (!subWalletStore.isWalletInitialized(wallet.id)) {
    try {
      await subWalletStore.connectWallet(wallet.source as SubstrateWalletSource)
    }
    catch (error) {
      console.error('Failed to connect wallet', { error, wallet })
      await walletManager.disconnectWallet(wallet)
      return
    }
  }

  subWalletStore.subscribeAccounts(wallet.id)

  walletStore.updateWallet(wallet.id, { state: WalletStates.Connected })
}

function watchForAuthorizedSubWallets() {
  watch(walletStates, async (states, prevState) => {
    for (const wallet of wallets.value.filter(w => w.vm === 'SUB')) {
      const freshAuthorizedState = states[wallet.id] === WalletStates.Authorized && prevState?.[wallet.id] !== WalletStates.Authorized

      if (freshAuthorizedState) {
        await connectSubWallet(wallet)
      }
    }
  }, { immediate: true })
}

function watchForEvmConnectionsChanges() {
  watch(currentEvmConnection, async (liveConnection) => {
    const evmWallets = wallets.value.filter(wallet => wallet.vm === 'EVM')
    const activeWalletId = liveConnection?.connector.id

    for (const wallet of evmWallets) {
      const isActiveWallet = wallet.id === activeWalletId

      if (!isActiveWallet) {
        if (wallet.accounts.length > 0 || wallet.state === WalletStates.Connected) {
          walletStore.updateWallet(wallet.id, {
            accounts: [],
            state: WalletStates.Idle,
          })
        }

        if (walletStore.isWalletAccountSelected(wallet)) {
          walletStore.setSelectedAccount('EVM', '')
          await accountStore.clearAuth('EVM')
        }

        continue
      }

      if (!liveConnection) {
        continue
      }

      const accounts = formatEvmAccounts({
        accounts: liveConnection.accounts.map(address => ({ address })),
        extension: wallet,
      })

      const currentAccountIds = wallet.accounts.map(account => account.id)
      const nextAccountIds = accounts.map(account => account.id)
      const accountsChanged = JSON.stringify(currentAccountIds) !== JSON.stringify(nextAccountIds)

      if (wallet.state !== WalletStates.Connected || accountsChanged) {
        walletStore.updateWallet(wallet.id, {
          accounts,
          state: WalletStates.Connected,
        })
      }
    }
  }, { immediate: true })
}

whenever(
  () => subWalletStore.injectionStatus !== 'checking',
  () => init(),
  { once: true, immediate: true },
)
</script>

<template>
  <UModal
    v-model:open="isModalOpen"
    :dismissible="false"
    :ui="{
      content: 'max-w-xl w-full',
    }"
  >
    <template #content>
      <div>
        <div class="flex justify-between items-start p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
              {{ title }}
            </h2>
            <p v-if="stage === WalletStageTypes.Account" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('wallet.whichAccountWouldYouLikeToUse') }}
            </p>
          </div>

          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-x"
            size="sm"
            @click="emit('close')"
          />
        </div>

        <div class="p-4 max-h-[70vh] overflow-y-auto">
          <WalletLoadingStage v-if="stage === WalletStageTypes.Loading" />

          <WalletSelectionStage v-else-if="stage === WalletStageTypes.Wallet" />

          <WalletAuthorizationStage v-else-if="stage === WalletStageTypes.Authorization" />

          <AccountSelectionStage
            v-else-if="stage === WalletStageTypes.Account"
            @select="payload => $emit('close', payload)"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
