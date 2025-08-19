<script setup lang="ts">
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

  wallets.value = extensions

  walletStore.setStage(WalletStageTypes.Wallet)
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

watch(() => wallets.value, (newWallets) => {
  for (const wallet of newWallets) {
    if (wallet.state === WalletStates.Authorized && wallet.vm === 'SUB') {
      walletStore.updateWallet(wallet.id, { state: WalletStates.Connected })
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

onMounted(init)
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
