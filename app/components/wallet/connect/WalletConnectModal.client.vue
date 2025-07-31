<script setup lang="ts">
import type { SubstrateWallet, SubstrateWalletSource } from '@/utils/wallet/substrate/types'
import { formatEvmAccounts, formatSubAccounts } from '@/utils/wallet'
import { REOWN_WALLET_CONFIG } from '@/utils/wallet/evm/config'

const emit = defineEmits(['close'])
const isModalOpen = defineModel<boolean>({ required: true })

const { t } = useI18n()
const subWalletStore = useSubWalletStore()
const walletStore = useWalletStore()

const { stage, wallets } = storeToRefs(walletStore)

async function init() {
  walletStore.setStage(WalletStageTypes.Loading)

  const extensions = await getWalletExtensions()

  await initWalletState()

  wallets.value = extensions

  walletStore.setStage(WalletStageTypes.Wallet)
}

async function initWalletState() {
  // sub
  subWalletStore.$subscribe((mutation, state) => {
    const events = Array.isArray(mutation.events) ? mutation.events : [mutation.events]

    for (const event of events) {
      if (event.key === 'accounts') {
        const targetId = (event.target as SubstrateWallet).id
        const extension = wallets.value.find(wallet => wallet.id === targetId)
        const accounts = state.wallets.find(wallet => wallet.id === targetId)?.accounts || []

        if (!extension) {
          return
        }

        walletStore.updateWallet(extension.id, {
          accounts: formatSubAccounts({
            accounts,
            extension,
          }),
        })
      }
    }
  })

  // evm
  const { accounts, wallet } = useReown()

  watch([
    accounts,
    wallet,
    computed(() => wallets.value.find(wallet => wallet.id === REOWN_WALLET_CONFIG.id)),
  ], ([accountsState, wallet, extension]) => {
    if (!accountsState || !extension || !wallet) {
      return
    }

    const accounts = formatEvmAccounts({ extension, wallet, accounts: accountsState })

    const toConnect = extension.state === WalletStates.Authorized
    const accountsChanged = !areArraysEqual(accounts.map(account => account.id), extension.accounts.map(account => account.id)) && extension.state === WalletStates.Connected

    if (!toConnect && !accountsChanged) {
      return
    }

    walletStore.updateWallet(extension.id, {
      state: WalletStates.Connected,
      accounts,
    })
  }, {
    immediate: true,
  })
}

async function getSubWalletExtensions(): Promise<WalletExtension[]> {
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

async function getWalletExtensions(): Promise<WalletExtension[]> {
  const subExtensions = await getSubWalletExtensions()
  const evmExtensions = getEvmWalletExtensions()

  const originalWallets = [
    ...subExtensions,
    ...evmExtensions,
  ]

  return originalWallets.map((wallet) => {
    const savedWallet = wallets.value.find(w => w.id === wallet.id)

    if (!savedWallet) {
      return wallet
    }

    let state: WalletState = WalletStates.Idle

    if (savedWallet.state === WalletStates.Connected) {
      state = WalletStates.Authorized
    }

    return {
      ...savedWallet,
      state,
    }
  })
}

const walletStates = computed<Record<string, WalletState>>(() => {
  return wallets.value.reduce((acc, wallet) => {
    Object.assign(acc, { [wallet.id]: wallet.state })
    return acc
  }, {})
})

// watch for unsyncedExtensions
watch(walletStates, (_, prevState) => {
  for (const wallet of wallets.value) {
    if (wallet.state === WalletStates.Authorized && prevState[wallet.id] !== WalletStates.Authorized) {
      execByVm({
        SUB: async () => {
          walletStore.updateWallet(wallet.id, { state: WalletStates.Connecting })

          if (!subWalletStore.isWalletInitialized(wallet.id)) {
            await subWalletStore.connectWallet(wallet.source as SubstrateWalletSource)
          }

          subWalletStore.subscribeAccounts(wallet.id)

          walletStore.updateWallet(wallet.id, { state: WalletStates.Connected })
        },
      }, { vm: wallet.vm })
    }
  }
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

if (import.meta.client) {
  watch(isModalOpen, (open) => {
    if (open) {
      init()
    }
  }, { once: true })
}
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
