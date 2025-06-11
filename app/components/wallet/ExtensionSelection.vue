<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet'
import { useSubWalletStore } from '~/stores/subWallet'

const emit = defineEmits(['extensionConnected', 'close'])

const walletStore = useWalletStore()
const subWalletStore = useSubWalletStore()

const { wallets, getIsEvmConnected, getIsSubstrateConnected } = storeToRefs(walletStore)
const { wallets: subWallets, initialized } = storeToRefs(subWalletStore)

const activeTab = ref<'ALL' | 'EVM' | 'SUB'>('ALL')
const connecting = ref<string | null>(null)
const showOtherWallets = ref(false)

if (import.meta.client) {
  await subWalletStore.init()
}

const tabOptions = [
  { value: 'ALL', label: 'All', icon: 'i-lucide-wallet' },
  { value: 'SUB', label: 'Polkadot', icon: 'i-simple-icons-polkadot' },
  { value: 'EVM', label: 'EVM', icon: 'i-simple-icons-ethereum' },
]

const installedSubstrateWallets = computed(() =>
  subWallets.value.filter(wallet => wallet.installed),
)

const uninstalledSubstrateWallets = computed(() =>
  subWallets.value.filter(wallet => !wallet.installed),
)

const recentlyUsedWallets = computed(() => {
  const recent = []

  if (getIsEvmConnected.value) {
    recent.push({
      type: 'EVM',
      name: 'MetaMask',
      icon: 'i-simple-icons-ethereum',
      connected: true,
      lastUsed: true,
    })
  }

  if (getIsSubstrateConnected.value && wallets.value.SUB.account?.extension) {
    const subWallet = subWallets.value.find(w => w.source === wallets.value.SUB.account?.extension)
    if (subWallet) {
      recent.push({
        type: 'SUB',
        name: subWallet.name,
        icon: subWallet.icon,
        connected: true,
        lastUsed: true,
        source: subWallet.source,
      })
    }
  }

  return recent
})

const availableWallets = computed(() => {
  const walletList = []

  // Add EVM wallets
  if (activeTab.value === 'ALL' || activeTab.value === 'EVM') {
    walletList.push({
      type: 'EVM',
      name: 'MetaMask',
      description: 'MetaMask, WalletConnect, and more',
      icon: 'i-simple-icons-ethereum',
      connected: getIsEvmConnected.value,
      installed: true,
    })
  }

  // Add Substrate wallets
  if (activeTab.value === 'ALL' || activeTab.value === 'SUB') {
    installedSubstrateWallets.value.forEach((wallet) => {
      walletList.push({
        type: 'SUB',
        name: wallet.name,
        description: wallet.accounts ? `${wallet.accounts.length} account${wallet.accounts.length !== 1 ? 's' : ''}` : 'Ready to connect',
        icon: wallet.icon,
        connected: getIsSubstrateConnected.value && wallets.value.SUB.account?.extension === wallet.source,
        installed: true,
        source: wallet.source,
      })
    })
  }

  return walletList
})

const otherWallets = computed(() => {
  if (activeTab.value === 'SUB' || activeTab.value === 'ALL') {
    return uninstalledSubstrateWallets.value.map(wallet => ({
      type: 'SUB',
      name: wallet.name,
      description: 'Not installed',
      icon: wallet.icon,
      connected: false,
      installed: false,
      url: wallet.url,
      source: wallet.source,
    }))
  }
  return []
})

async function connectEvmWallet() {
  if (connecting.value === 'EVM')
    return

  connecting.value = 'EVM'
  try {
    // Trigger EVM wallet connection (this will be handled by the existing EVM wallet logic)
    // For now, we'll just emit the event to go to account selection
    // The actual connection will be handled in the account selection phase
    emit('extensionConnected', 'EVM')
  }
  catch (error) {
    console.error('Failed to connect EVM wallet:', error)
  }
  finally {
    connecting.value = null
  }
}

async function connectSubstrateWallet(source: string) {
  if (connecting.value === source)
    return

  connecting.value = source
  try {
    await subWalletStore.connectWallet(source as any)

    const walletData = subWallets.value.find(w => w.source === source)
    if (walletData?.accounts && walletData.accounts.length > 0) {
      emit('extensionConnected', 'SUB')
    }
  }
  catch (error) {
    console.error('Failed to connect Substrate wallet:', error)
  }
  finally {
    connecting.value = null
  }
}

function disconnectWallet(type: string, source?: string) {
  if (type === 'EVM') {
    walletStore.disconnect('EVM')
  }
  else if (type === 'SUB') {
    walletStore.disconnect('SUB')
    if (source) {
      subWalletStore.disconnectWallet(source as any)
    }
  }
}

function handleWalletAction(wallet: any) {
  if (wallet.connected) {
    emit('extensionConnected', wallet.type)
  }
  else {
    if (wallet.type === 'EVM') {
      connectEvmWallet()
    }
    else {
      connectSubstrateWallet(wallet.source)
    }
  }
}

function connectAllWallets() {
  availableWallets.value.forEach((wallet) => {
    if (!wallet.connected && wallet.installed) {
      handleWalletAction(wallet)
    }
  })
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex justify-between items-center p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <UIcon name="i-lucide-wallet" class="w-6 h-6 text-primary-500" />
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
          CONNECT WALLET
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

    <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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

      <!-- Recently Used Section -->
      <div v-if="recentlyUsedWallets.length > 0" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Installed & recently used
          </h3>
        </div>

        <div class="space-y-3">
          <UCard
            v-for="wallet in recentlyUsedWallets"
            :key="`recent-${wallet.type}-${wallet.name}`"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="handleWalletAction(wallet)"
          >
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-full bg-success-100 dark:bg-success-800 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="wallet.icon && !wallet.icon.startsWith('i-')"
                    :src="wallet.icon"
                    :alt="`${wallet.name} logo`"
                    class="w-8 h-8 object-contain"
                  >
                  <UIcon
                    v-else
                    :name="wallet.icon || 'i-lucide-wallet'"
                    class="w-6 h-6 text-success-600 dark:text-success-400"
                  />
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-medium text-gray-900 dark:text-gray-100">
                      {{ wallet.name }}
                    </span>
                    <UBadge
                      v-if="wallet.type === 'EVM'"
                      color="info"
                      size="xs"
                    >
                      EVM
                    </UBadge>
                  </div>
                  <div class="text-sm text-success-600 dark:text-success-400">
                    Last connected
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <UBadge
                  v-if="wallet.connected"
                  color="success"
                  size="xs"
                >
                  Connected
                </UBadge>
                <UButton
                  v-if="wallet.connected"
                  color="error"
                  variant="soft"
                  size="sm"
                  @click.stop="disconnectWallet(wallet.type, wallet.source)"
                >
                  Disconnect
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- All Installed Wallets Section -->
      <div v-if="availableWallets.length > 0" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            All installed wallets
          </h3>
          <UButton
            variant="soft"
            color="primary"
            size="sm"
            @click="connectAllWallets"
          >
            Connect all
          </UButton>
        </div>

        <div class="space-y-3">
          <UCard
            v-for="wallet in availableWallets"
            :key="`${wallet.type}-${wallet.name}`"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="handleWalletAction(wallet)"
          >
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="wallet.icon && !wallet.icon.startsWith('i-')"
                    :src="wallet.icon"
                    :alt="`${wallet.name} logo`"
                    class="w-8 h-8 object-contain"
                  >
                  <UIcon
                    v-else
                    :name="wallet.icon || 'i-lucide-wallet'"
                    class="w-6 h-6 text-gray-600 dark:text-gray-400"
                  />
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-medium text-gray-900 dark:text-gray-100">
                      {{ wallet.name }}
                    </span>
                    <UBadge
                      v-if="wallet.type === 'EVM'"
                      color="info"
                      size="xs"
                    >
                      EVM
                    </UBadge>
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ wallet.description }}
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <UBadge
                  v-if="wallet.connected"
                  color="success"
                  size="xs"
                >
                  Connected
                </UBadge>
                <UButton
                  v-if="wallet.connected"
                  color="primary"
                  variant="soft"
                  size="sm"
                  :loading="connecting === wallet.source || connecting === wallet.type"
                  @click.stop="handleWalletAction(wallet)"
                >
                  Select
                </UButton>
                <UButton
                  v-else
                  color="primary"
                  size="sm"
                  :loading="connecting === wallet.source || connecting === wallet.type"
                  @click.stop="handleWalletAction(wallet)"
                >
                  {{ connecting === wallet.source || connecting === wallet.type ? 'Connecting...' : 'Connect' }}
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Other Wallets Section -->
      <div v-if="otherWallets.length > 0" class="space-y-4">
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            block
            class="justify-between"
            @click="showOtherWallets = !showOtherWallets"
          >
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Other wallets
            </span>
            <UIcon
              :name="showOtherWallets ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              class="w-4 h-4"
            />
          </UButton>

          <div v-if="showOtherWallets" class="mt-3 space-y-2">
            <UCard
              v-for="wallet in otherWallets"
              :key="`other-${wallet.type}-${wallet.name}`"
              class="opacity-60"
            >
              <div class="flex items-center justify-between p-4">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    <img
                      v-if="wallet.icon && !wallet.icon.startsWith('i-')"
                      :src="wallet.icon"
                      :alt="`${wallet.name} logo`"
                      class="w-8 h-8 object-contain"
                    >
                    <UIcon
                      v-else
                      name="i-lucide-download"
                      class="w-6 h-6 text-gray-400"
                    />
                  </div>
                  <div>
                    <div class="font-medium text-gray-700 dark:text-gray-300">
                      {{ wallet.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ wallet.description }}
                    </div>
                  </div>
                </div>
                <a
                  :href="wallet.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.stop
                >
                  <UButton
                    color="info"
                    variant="soft"
                    icon="i-lucide-external-link"
                    size="sm"
                  >
                    Install
                  </UButton>
                </a>
              </div>
            </UCard>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!initialized && availableWallets.length === 0" class="text-center py-8">
        <div class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-16 w-full" />
        </div>
      </div>
    </div>
  </div>
</template>
