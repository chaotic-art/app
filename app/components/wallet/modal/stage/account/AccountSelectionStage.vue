<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet'
import { WalletStageTypes } from '~/stores/wallet/types'

const walletStore = useWalletStore()
const { disconnectWallet } = useWalletManager()

const { wallets, getConnectedWallets: connectedWallets } = storeToRefs(walletStore)

const searchQuery = ref('')

const selectedWallets = computed(() => wallets.value.filter(wallet => wallet.isSelected))
const selectedAccounts = computed(() => selectedWallets.value.flatMap(wallet => wallet.accounts.map(account => ({
  account,
  extension: wallet,
}))))

const filteredAccounts = computed(() => {
  if (!searchQuery.value)
    return selectedAccounts.value

  const query = searchQuery.value.toLowerCase()
  return selectedAccounts.value.filter(({ account }) =>
    account.name.toLowerCase().includes(query)
    || account.address.toLowerCase().includes(query))
})

function hadnleAccountSelect(accountId: string) {
  const [walletId] = accountId.split(':')
  const wallet = wallets.value.find(wallet => wallet.id === walletId)

  if (!wallet) {
    return
  }

  walletStore.setSelectedAccount(wallet.vm, accountId)
}

function backToWalletSelection() {
  walletStore.setStage(WalletStageTypes.Wallet)
}

function handleManageWallets() {
  walletStore.clearSelectedWallets()
  backToWalletSelection()
}

function handleLogout() {
  for (const extension of connectedWallets.value) {
    disconnectWallet(extension)
  }

  backToWalletSelection()
}
</script>

<template>
  <div class="space-y-2">
    <UInput
      v-model="searchQuery"
      :placeholder="$t('wallet.searchByNameOrPasteAddress')"
      icon="i-lucide-search"
      size="lg"
      class="w-full"
    />

    <WalletAccountList
      :items="filteredAccounts"
      @select="hadnleAccountSelect"
    />

    <WalletAccountFooter
      :extensions="connectedWallets"
      @manage="handleManageWallets"
      @logout="handleLogout"
    />
  </div>
</template>
