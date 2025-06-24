<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'
import { useSubWalletStore } from '@/stores/subWallet'
import { useWalletStore } from '@/stores/wallet'
import { WalletStageTypes, WalletStates } from '@/stores/wallet/types'

const emit = defineEmits(['select', 'disconnect', 'close'])
const isModalOpen = defineModel<boolean>({ required: true })

const { t } = useI18n()
const subWalletStore = useSubWalletStore()
const walletStore = useWalletStore()
const { stage } = storeToRefs(walletStore)

if (import.meta.client) {
  init()
}

async function init() {
  const extensions = await getWalletExtensions()

  // TODO: add a sync extension mechanism
  for (const extension of extensions) {
    walletStore.addWallet(extension)
  }

  walletStore.setStage(WalletStageTypes.Wallet)
}

async function getSubWalletExtensions(): Promise<WalletExtension[]> {
  const wallets = await subWalletStore.init()

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

function getEvmWalletExtension(): WalletExtension {
  return {
    id: 'reown',
    name: 'EVM Wallets',
    icon: '/partners/logo-reown.png',
    url: '',
    source: 'reown',
    installed: true,
    vm: 'EVM',
    accounts: [],
    state: WalletStates.Idle,
  }
}

async function getWalletExtensions(): Promise<WalletExtension[]> {
  const subExtensions = await getSubWalletExtensions()
  const evmExtension = getEvmWalletExtension()

  return [
    ...subExtensions,
    evmExtension,
  ]
}

const title = computed(() => {
  if (stage.value === WalletStageTypes.Wallet) {
    return t('wallet.selectWallet')
  }
  else if (stage.value === WalletStageTypes.Account) {
    return t('wallet.selectAccount')
  }
  return ''
})
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
          <WalletSelectionStage v-if="stage === WalletStageTypes.Wallet" />

          <WalletAuthorizationStage v-else-if="stage === WalletStageTypes.Authorization" />

          <AccountSelectionStage v-else-if="stage === WalletStageTypes.Account" />
        </div>
      </div>
    </template>
  </UModal>
</template>
