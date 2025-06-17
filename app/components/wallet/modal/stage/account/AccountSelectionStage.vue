<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()

const { wallets } = storeToRefs(walletStore)
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
</script>

<template>
  <div class="space-y-2">
    <UInput
      v-model="searchQuery"
      placeholder="Search by name or paste address"
      icon="i-lucide-search"
      size="lg"
      class="w-full"
    />

    <WalletAccountList
      :items="filteredAccounts"
      @select="hadnleAccountSelect"
    />
  </div>
</template>
