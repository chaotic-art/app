<script setup lang="ts">
import type { SubstrateWalletSource } from '@/utils/wallet/substrate/types'
import { whenever } from '@vueuse/core'
import { formatSubAccounts } from '@/utils/wallet'
import { REOWN_WALLET_CONFIG } from '@/utils/wallet/evm/config'

const emit = defineEmits(['close'])
const isModalOpen = defineModel<boolean>({ required: true })

const { t } = useI18n()
const subWalletStore = useSubWalletStore()
const walletStore = useWalletStore()
const walletManager = useWalletManager()

const { stage, wallets } = storeToRefs(walletStore)

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
  // watchForAuthorizedEvmWallets()
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
  return [
    {
      ...REOWN_WALLET_CONFIG,
      accounts: [],
      state: WalletStates.Idle,
    },
  ]
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

// Disabled after #559
// function watchForAuthorizedEvmWallets() {
//   const { accounts, wallet } = useReown()

//   watch([
//     accounts,
//     wallet,
//     computed(() => wallets.value.find(wallet => wallet.id === REOWN_WALLET_CONFIG.id)),
//   ], ([accountsState, wallet, extension]) => {
//     if (!accountsState || !extension || !wallet) {
//       return
//     }

//     const accounts = formatEvmAccounts({ extension, wallet, accounts: accountsState })

//     const toConnect = extension.state === WalletStates.Authorized
//     const accountsChanged = !areArraysEqual(accounts.map(account => account.id), extension.accounts.map(account => account.id)) && extension.state === WalletStates.Connected

//     if (!toConnect && !accountsChanged) {
//       return
//     }

//     walletStore.updateWallet(extension.id, {
//       state: WalletStates.Connected,
//       accounts,
//     })
//   }, {
//     immediate: true,
//   })
// }

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
