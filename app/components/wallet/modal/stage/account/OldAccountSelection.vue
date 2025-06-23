<script setup lang="ts">
import type { ChainVM } from '@kodadot1/static'
import type { SetWalletParams, WalletAccount } from '@/stores/wallet'
import type { SubstrateWalletSource } from '~/utils/wallet/substrate/types'
import { useAppKit, useAppKitAccount } from '@reown/appkit/vue'
import { useAccountStore } from '@/stores/account'
import { useWalletStore } from '@/stores/wallet'
import { useSubWalletStore } from '~/stores/subWallet'

const props = defineProps<{
  walletType: ChainVM
}>()

const emit = defineEmits(['selectAccount', 'back', 'close'])

const walletStore = useWalletStore()
const subWalletStore = useSubWalletStore()
const accountStore = useAccountStore()

const { wallets, getIsEvmConnected, getIsSubstrateConnected } = storeToRefs(walletStore)
const { wallets: subWallets } = storeToRefs(subWalletStore)
const evmAccountData = useAppKitAccount()

const searchQuery = ref('')
const activeTab = ref<'ALL' | 'EVM' | 'SUB'>('ALL')
const connecting = ref<string | null>(null)

const tabOptions = [
  { value: 'ALL', label: 'All', icon: 'i-lucide-wallet' },
  { value: 'SUB', label: 'Polkadot', icon: 'i-simple-icons-polkadot' },
  { value: 'EVM', label: 'EVM', icon: 'i-simple-icons-ethereum' },
]

const { $jdenticon } = useNuxtApp()
function generateAvatar(address: string): string {
  if (import.meta.client && $jdenticon) {
    return $jdenticon.toSvg(address, 40)
  }
  return ''
}

const availableAccounts = computed(() => {
  const accounts = []

  // Add EVM accounts
  if ((activeTab.value === 'ALL' || activeTab.value === 'EVM') && getIsEvmConnected.value && wallets.value.EVM.account) {
    accounts.push({
      vm: 'EVM' as ChainVM,
      address: wallets.value.EVM.account.address,
      name: wallets.value.EVM.account.name || 'EVM Account',
      balance: '$0', // TODO: Implement balance fetching
      type: 'EVM',
      icon: 'i-simple-icons-ethereum',
      isSelected: wallets.value.EVM.account.address === accountStore.getAuthAddress('EVM'),
    })
  }

  // Add Substrate accounts
  if ((activeTab.value === 'ALL' || activeTab.value === 'SUB') && getIsSubstrateConnected.value) {
    const connectedWallet = subWallets.value.find(w => w.source === wallets.value.SUB.account?.extension)
    if (connectedWallet?.accounts) {
      connectedWallet.accounts.forEach((account) => {
        accounts.push({
          vm: 'SUB' as ChainVM,
          address: account.address,
          name: account.name || 'Substrate Account',
          balance: '$0', // TODO: Implement balance fetching
          type: 'SUB',
          icon: 'i-simple-icons-polkadot',
          source: account.source,
          isSelected: account.address === accountStore.getAuthAddress('SUB'),
        })
      })
    }
  }

  return accounts
})

const filteredAccounts = computed(() => {
  if (!searchQuery.value)
    return availableAccounts.value

  const query = searchQuery.value.toLowerCase()
  return availableAccounts.value.filter(account =>
    account.name.toLowerCase().includes(query)
    || account.address.toLowerCase().includes(query))
})

const connectedWalletsCount = computed(() => {
  let count = 0
  if (getIsEvmConnected.value)
    count++
  if (getIsSubstrateConnected.value)
    count++
  return count
})

async function selectAccount(account: any) {
  try {
    connecting.value = account.address

    // Handle EVM accounts that need selection
    if (account.type === 'EVM' && account.needsSelection) {
      const walletAccount: WalletAccount = {
        address: account.address,
        name: account.name,
      }

      const params: SetWalletParams = {
        vm: 'EVM',
        account: walletAccount,
      }

      walletStore.setWallet(params)
      accountStore.setAuth({ vm: 'EVM', address: account.address })
      emit('selectAccount', params)
      return
    }

    // Handle Substrate accounts that need connection
    if (account.type === 'SUB' && account.needsConnection && account.walletSource) {
      await subWalletStore.connectWallet(account.walletSource as SubstrateWalletSource)

      // After connection, set the account
      const walletAccount: WalletAccount = {
        address: account.address,
        name: account.name,
        extension: account.source,
      }

      const params: SetWalletParams = {
        vm: 'SUB',
        account: walletAccount,
      }

      walletStore.setWallet(params)
      accountStore.setAuth({ vm: 'SUB', address: account.address })
      emit('selectAccount', params)
      return
    }

    // Handle already connected accounts
    const walletAccount: WalletAccount = {
      address: account.address,
      name: account.name,
      extension: account.source,
    }

    const params: SetWalletParams = {
      vm: account.vm,
      account: walletAccount,
    }

    walletStore.setWallet(params)
    accountStore.setAuth({ vm: account.vm, address: account.address })
    emit('selectAccount', params)
  }
  catch (error) {
    console.error('Failed to select account:', error)
  }
  finally {
    connecting.value = null
  }
}

async function connectEvmWallet() {
  if (connecting.value === 'EVM')
    return

  connecting.value = 'EVM'
  try {
    useAppKit().open()
  }
  catch (error) {
    console.error('Failed to connect EVM wallet:', error)
  }
  finally {
    connecting.value = null
  }
}

function logoutAll() {
  if (getIsEvmConnected.value) {
    walletStore.disconnect('EVM')
    accountStore.clearAuth('EVM')
  }
  if (getIsSubstrateConnected.value) {
    walletStore.disconnect('SUB')
    accountStore.clearAuth('SUB')
    if (wallets.value.SUB.account?.extension) {
      subWalletStore.disconnectWallet(wallets.value.SUB.account.extension as any)
    }
  }
  emit('close')
}

function handleAddressInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Check if it's a valid address (basic validation)
  if (value.length > 10 && (value.startsWith('0x') || value.length > 40)) {
    // Could be a valid address, add it as a custom account
    // This would require additional implementation
  }
}

onMounted(() => {
  if (props.walletType) {
    activeTab.value = props.walletType
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex justify-between items-center p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="emit('back')"
        />
        <UIcon name="i-lucide-user" class="w-6 h-6 text-primary-500" />
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
          SELECT ACCOUNT
        </h2>
      </div>
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-lucide-x"
        size="sm"
        @click="emit('close')"
      />
    </div>

    <div class="p-6">
      <div class="space-y-6">
        <!-- Subtitle -->
        <div class="text-center">
          <p class="text-gray-600 dark:text-gray-400">
            Which account would you like to use?
          </p>
        </div>

        <!-- Search Input -->
        <div class="space-y-2">
          <UInput
            v-model="searchQuery"
            placeholder="Search by name or paste address"
            icon="i-lucide-search"
            size="lg"
            class="w-full"
            @input="handleAddressInput"
          />
        </div>

        <!-- Tab Navigation -->
        <div class="flex justify-center">
          <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <UButton
              v-for="tab in tabOptions"
              :key="tab.value"
              :variant="activeTab === tab.value ? 'solid' : 'ghost'"
              :color="activeTab === tab.value ? 'primary' : 'neutral'"
              size="sm"
              class="flex-1 min-w-[100px]"
              @click="activeTab = tab.value as 'ALL' | 'EVM' | 'SUB'"
            >
              <UIcon :name="tab.icon" class="w-4 h-4 mr-2" />
              {{ tab.label }}
            </UButton>
          </div>
        </div>

        <!-- Accounts List -->
        <div class="space-y-3 max-h-[50vh] overflow-y-auto">
          <!-- Connect EVM Wallet if not connected -->
          <div v-if="(activeTab === 'ALL' || activeTab === 'EVM') && !getIsEvmConnected && !evmAccountData.address" class="space-y-3">
            <UCard class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" @click="connectEvmWallet">
              <div class="flex items-center justify-between p-4">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-full bg-info-100 dark:bg-info-900/20 flex items-center justify-center">
                    <UIcon name="i-simple-icons-ethereum" class="w-6 h-6 text-info-600" />
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-gray-100">
                      Connect EVM Wallet
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      MetaMask, WalletConnect, and more
                    </div>
                  </div>
                </div>
                <UButton
                  color="info"
                  :loading="connecting === 'EVM'"
                  :disabled="connecting === 'EVM'"
                  @click.stop="connectEvmWallet"
                >
                  {{ connecting === 'EVM' ? 'Connecting...' : 'Connect' }}
                </UButton>
              </div>
            </UCard>
          </div>

          <div v-if="filteredAccounts.length === 0 && !(activeTab === 'ALL' || activeTab === 'EVM')" class="text-center py-8">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <UIcon name="i-lucide-user" class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No accounts found
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              Try adjusting your search or connect more wallets
            </p>
          </div>

          <UCard
            v-for="account in filteredAccounts"
            :key="`${account.vm}-${account.address}`"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'ring-2 ring-primary-500': account.isSelected }"
            @click="selectAccount(account)"
          >
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <div
                    class="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                    v-html="generateAvatar(account.address)"
                  />
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                    <UIcon
                      :name="account.icon"
                      :class="account.type === 'EVM' ? 'w-3 h-3 text-info-600' : 'w-3 h-3 text-secondary-600'"
                    />
                  </div>
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-900 dark:text-gray-100">
                    {{ account.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ account.address.slice(0, 6) }}...{{ account.address.slice(-4) }}
                  </div>
                  <div class="flex items-center space-x-2 mt-1">
                    <UBadge
                      :color="account.type === 'EVM' ? 'info' : 'secondary'"
                      size="xs"
                    >
                      {{ account.type === 'EVM' ? 'EVM' : 'Polkadot' }}
                    </UBadge>
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ account.balance }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon
                  v-if="account.isSelected"
                  name="i-lucide-check"
                  class="w-5 h-5 text-primary-500"
                />
                <UIcon
                  v-else-if="connecting === account.address"
                  name="i-lucide-loader-2"
                  class="w-5 h-5 text-primary-500 animate-spin"
                />
              </div>
            </div>
          </UCard>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="flex -space-x-2">
              <div
                v-for="n in Math.min(connectedWalletsCount, 3)"
                :key="n"
                class="w-8 h-8 rounded-full bg-success-100 dark:bg-success-800 border-2 border-white dark:border-gray-900 flex items-center justify-center"
              >
                <UIcon name="i-lucide-wallet" class="w-4 h-4 text-success-600 dark:text-success-400" />
              </div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ connectedWalletsCount }} connected
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              @click="emit('back')"
            >
              Manage wallets
            </UButton>
            <UButton
              color="error"
              variant="soft"
              size="sm"
              icon="i-lucide-log-out"
              @click="logoutAll"
            >
              Log out
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
