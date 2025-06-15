<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'
import { useSubWalletStore } from '@/stores/subWallet'
import { useWalletStore } from '@/stores/wallet'
import { WalletStageTypes, WalletStates } from '@/stores/wallet/types'

const emit = defineEmits(['select', 'disconnect', 'close'])
const isModalOpen = defineModel<boolean>({ required: true })

const subWalletStore = useSubWalletStore()
const walletStore = useWalletStore()

const { stage, wallets: walletExtensions } = storeToRefs(walletStore)

if (import.meta.client) {
  init()
}

async function init() {
  walletExtensions.value = await getWalletExtensions()
  stage.value = WalletStageTypes.Wallet
}

async function getSubWalletExtensions(): Promise<WalletExtension[]> {
  const wallets = await subWalletStore.init()

  return wallets.map(extension => ({
    id: extension.id,
    name: extension.name,
    icon: extension.icon,
    connected: extension.enabled,
    url: extension.url,
    source: extension.source,
    installed: extension.installed,
    vm: 'SUB',
    accounts: [],
    state: WalletStates.Idle,
  }))
}

async function getWalletExtensions(): Promise<WalletExtension[]> {
  const subExtensions = await getSubWalletExtensions()

  return [
    ...subExtensions,
  ]
}

const title = computed(() => {
  if (stage.value === WalletStageTypes.Wallet) {
    return 'Select Wallet'
  }
  else if (stage.value === WalletStageTypes.Account) {
    return 'Select Account'
  }
  return ''
})
</script>

<template>
  <UModal v-model:open="isModalOpen">
    <template #content>
      <div>
        <div class="flex justify-between items-start p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
              {{ title }}
            </h2>
            <p v-if="stage === WalletStageTypes.Account" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Which account would you like to use?
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

        <div class="p-4">
          <WalletSelectionStage v-if="stage === WalletStageTypes.Wallet" />

          <WalletAuthorizationStage v-else-if="stage === WalletStageTypes.Authorization" />

          <AccountSelectionStage v-else-if="stage === WalletStageTypes.Account" />
        </div>
      </div>
    </template>
  </UModal>
</template>
