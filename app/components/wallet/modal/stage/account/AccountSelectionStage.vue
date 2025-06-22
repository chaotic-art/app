<script setup lang="ts">
import { useAccountStore } from '@/stores/account'
import { useWalletStore } from '@/stores/wallet'
import { WalletStageTypes } from '@/stores/wallet/types'

const walletStore = useWalletStore()
const { disconnectWallet } = useWalletManager()
const accountStore = useAccountStore()

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
    account.name?.toLowerCase().includes(query)
    || account.address.toLowerCase().includes(query))
})

function handleAccountSelect(accountId: string) {
  // TODO: add destrucure account id method
  const [walletId] = accountId.split(':')
  const wallet = wallets.value.find(wallet => wallet.id === walletId)

  if (!wallet) {
    return
  }

  const account = wallet.accounts.find(account => account.id === accountId)

  if (!account) {
    return
  }

  walletStore.setSelectedAccount(wallet.vm, accountId)
  accountStore.setAuth({ vm: wallet.vm, address: account.address })
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
      class="max-h-[400px] overflow-y-auto"
      :items="filteredAccounts"
      @select="handleAccountSelect"
    />

    <WalletAccountFooter
      :extensions="connectedWallets"
      @manage="handleManageWallets"
      @logout="handleLogout"
    />
  </div>
</template>
