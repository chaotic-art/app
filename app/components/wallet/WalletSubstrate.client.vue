<script setup lang="ts">
import type { WalletAccount } from '@/stores/wallet'
import type { SubstrateWalletAccount, SubstrateWalletSource } from '~/utils/wallet/substrate/types'
import { useWalletStore } from '@/stores/wallet'
import { useSubWalletStore } from '~/stores/subWallet'

const emit = defineEmits<{
  select: [account: WalletAccount]
}>()

const subWalletStore = useSubWalletStore()
const walletStore = useWalletStore()

const { wallets: subWallets, initialized } = storeToRefs(subWalletStore)
const { wallets } = storeToRefs(walletStore)
const selectedWallet = ref<SubstrateWalletSource | null>(null)
const selectedAccount = computed(() => wallets.value.SUB.account?.address)
const searchQuery = ref('')

if (import.meta.client) {
  await subWalletStore.init()
}

async function selectWallet(source: SubstrateWalletSource, _installed: boolean) {
  await subWalletStore.connectWallet(source)
  selectedWallet.value = source
}

function selectAccount(account: SubstrateWalletAccount) {
  emit('select', {
    address: account.address,
    name: account.name,
    extension: account.source,
  })
}

function resetWalletSelection() {
  selectedWallet.value = null
  searchQuery.value = ''
}

const filteredAccounts = computed(() => {
  const selectedWalletData = subWallets.value.find(w => w.source === selectedWallet.value)
  if (!selectedWalletData?.accounts)
    return []

  if (!searchQuery.value)
    return selectedWalletData.accounts

  return selectedWalletData.accounts.filter(account =>
    account.name?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

function disconnectWallet() {
  if (!selectedWallet.value) {
    return
  }

  walletStore.setDisconnecting('SUB', true)
  subWalletStore.disconnectWallet(selectedWallet.value)
  walletStore.disconnect('SUB')
  resetWalletSelection()
}
</script>

<template>
  <div class="wallet-selector space-y-4">
    <!-- Loading Skeleton -->
    <div v-if="!initialized">
      <div class="space-y-3">
        <USkeleton v-for="i in 3" :key="i" class="h-16 w-full" />
      </div>
    </div>

    <!-- Wallet Selection Step -->
    <div v-else-if="!selectedWallet">
      <div class="space-y-3">
        <UCard
          v-for="wallet in subWallets"
          :key="wallet.source"
          class="wallet-card p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          :class="{ 'opacity-50': !wallet.installed }"
          @click="selectWallet(wallet.source, wallet.installed)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="mr-3 w-8 h-8 flex items-center justify-center overflow-hidden rounded-full">
                <img v-if="wallet.icon" :src="wallet.icon || ''" :alt="`${wallet.source} logo`" class="w-full h-full object-contain">
                <UIcon v-else :name="wallet.installed ? 'i-lucide-wallet' : 'i-lucide-x-circle'" />
              </div>
              <div class="flex items-center">
                <div class="font-medium">
                  {{ wallet.name }}
                </div>
                <UBadge
                  v-if="wallet.accounts && wallet.accounts.some(acc => acc.address === selectedAccount)"
                  class="ml-2"
                  color="primary"
                  size="xs"
                >
                  {{ $t('wallet.connected') }}
                </UBadge>
              </div>
            </div>
            <a
              v-if="!wallet.installed"
              :href="wallet.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block"
            >
              <UButton
                color="warning"
                variant="ghost"
                icon="i-lucide-download"
                size="xs"
              />
            </a>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Account Selection Step -->
    <div v-else>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            @click="resetWalletSelection"
          >
            {{ $t('wallet.backToWalletSelection') }}
          </UButton>
        </div>
        <div v-if="selectedWallet" class="flex items-center">
          <img
            v-if="subWallets.find(w => w.source === selectedWallet)?.icon"
            :src="subWallets.find(w => w.source === selectedWallet)?.icon || ''"
            :alt="`${selectedWallet} logo`"
            class="w-6 h-6 mr-2 object-contain"
          >
          <span class="font-medium">{{ selectedWallet }}</span>
        </div>
      </div>

      <!-- Selected wallet content -->
      <div class="p-4 space-y-3">
        <UButton
          v-if="(!subWallets.find(w => w.source === selectedWallet)?.accounts
            || subWallets.find(w => w.source === selectedWallet)?.accounts?.length === 0)"
          color="primary"
          block
          @click="selectWallet(selectedWallet, true)"
        >
          <div class="flex items-center justify-center">
            <img
              v-if="subWallets.find(w => w.source === selectedWallet)?.icon"
              :src="subWallets.find(w => w.source === selectedWallet)?.icon || ''"
              :alt="`${selectedWallet} logo`"
              class="w-5 h-5 mr-2 object-contain"
            >
            <UIcon v-else name="i-lucide-link" class="mr-2" />
            <span>{{ $t('wallet.connect_with', { name: selectedWallet }) }}</span>
          </div>
        </UButton>

        <!-- Accounts List -->
        <div
          v-if="subWallets.find(w => w.source === selectedWallet)?.accounts
            && subWallets.find(w => w.source === selectedWallet)?.accounts?.length"
          class="mt-3"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="font-medium text-sm text-gray-700 dark:text-gray-300">
              {{ $t('wallet.availableAccounts') }}
            </div>
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              :placeholder="$t('wallet.searchAccountsPlaceholder')"
              size="sm"
              class="max-w-xs"
            />
          </div>
          <div class="space-y-2 mt-2">
            <UCard
              v-for="account in filteredAccounts"
              :key="account.address"
              class="account-card p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              :class="{
                'border-2 border-primary-500 bg-primary-50 dark:bg-primary-950/50 dark:border-primary-400': selectedAccount === account.address,
              }"
              @click="selectAccount(account)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">
                    {{ account.name || $t('wallet.unknownAccount') }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ account.address }}
                  </div>
                </div>
                <UIcon v-if="selectedAccount === account.address" name="i-lucide-check-circle" class="text-primary-500 dark:text-primary-400" />
              </div>
            </UCard>
          </div>
        </div>

        <!-- Disconnect wallet button -->
        <div
          v-if="walletStore.wallets.SUB.connected"
          class="mt-6"
        >
          <UButton
            color="error"
            variant="soft"
            block
            @click="disconnectWallet"
          >
            <div class="flex items-center justify-center">
              <UIcon name="i-lucide-unlink" class="mr-2" />
              <span>{{ $t('wallet.disconnect') }}</span>
            </div>
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
