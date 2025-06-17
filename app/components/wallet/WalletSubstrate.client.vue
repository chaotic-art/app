<script setup lang="ts">
import type { WalletAccount } from '@/stores/wallet/types'
import type { SubstrateWalletSource } from '~/utils/wallet/substrate/types'
import { useWalletStore } from '@/stores/wallet'
import { useSubWalletStore } from '~/stores/subWallet'

const emit = defineEmits<{
  select: [account: WalletAccount]
  disconnect: []
}>()

const subWalletStore = useSubWalletStore()
const walletStore = useWalletStore()

const { wallets: subWallets, initialized } = storeToRefs(subWalletStore)
const { wallets } = storeToRefs(walletStore)
const connecting = ref<string | null>(null)
const showUninstalled = ref(false)

if (import.meta.client) {
  await subWalletStore.init()
}

const installedWallets = computed(() =>
  subWallets.value.filter(wallet => wallet.installed),
)

const uninstalledWallets = computed(() =>
  subWallets.value.filter(wallet => !wallet.installed),
)

const connectedWallet = computed(() => wallets.value.SUB)

async function connectWallet(source: SubstrateWalletSource) {
  if (connecting.value === source)
    return

  connecting.value = source
  try {
    await subWalletStore.connectWallet(source)

    const walletData = subWallets.value.find(w => w.source === source)
    if (walletData?.accounts && walletData.accounts.length > 0) {
      const account = walletData.accounts[0]
      if (account) {
        emit('select', {
          address: account.address,
          name: account.name,
          extension: account.source,
        })
      }
    }
  }
  catch (error) {
    console.error('Failed to connect Substrate wallet:', error)
  }
  finally {
    connecting.value = null
  }
}

function disconnectWallet() {
  if (connectedWallet.value.account?.extension) {
    subWalletStore.disconnectWallet(connectedWallet.value.account.extension)
  }
  walletStore.disconnect('SUB')
  emit('disconnect')
}

function isWalletConnected(source: SubstrateWalletSource) {
  return connectedWallet.value.connected
    && connectedWallet.value.account?.extension === source
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="!initialized" class="space-y-3">
      <USkeleton v-for="i in 2" :key="i" class="h-16 w-full" />
    </div>

    <UCard
      v-else-if="connectedWallet.connected && connectedWallet.account"
      class="border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20"
    >
      <div class="flex items-center justify-between p-3">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-success-100 dark:bg-success-800 flex items-center justify-center">
            <UIcon name="i-simple-icons-polkadot" class="w-5 h-5 text-success-600 dark:text-success-400" />
          </div>
          <div>
            <div class="font-medium text-success-800 dark:text-success-200">
              {{ connectedWallet.account.name || $t('wallet.connected') }}
            </div>
            <div class="text-sm text-success-600 dark:text-success-400">
              {{ connectedWallet.account.address.slice(0, 6) }}...{{ connectedWallet.account.address.slice(-4) }}
            </div>
          </div>
        </div>
        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-unlink"
          size="sm"
          @click="disconnectWallet"
        >
          {{ $t('wallet.disconnect') }}
        </UButton>
      </div>
    </UCard>

    <div v-else class="space-y-3">
      <div v-if="installedWallets.length > 0" class="space-y-2">
        <UCard
          v-for="wallet in installedWallets"
          :key="wallet.source"
          class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          @click="connectWallet(wallet.source)"
        >
          <div class="flex items-center justify-between p-3">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900/20 flex items-center justify-center overflow-hidden">
                <img
                  v-if="wallet.icon"
                  :src="wallet.icon"
                  :alt="`${wallet.name} logo`"
                  class="w-6 h-6 object-contain"
                >
                <UIcon v-else name="i-simple-icons-polkadot" class="w-5 h-5 text-secondary-600" />
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-gray-100">
                  {{ wallet.name }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ wallet.accounts ? `${wallet.accounts.length} account${wallet.accounts.length !== 1 ? 's' : ''}` : 'Ready to connect' }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <UBadge
                v-if="isWalletConnected(wallet.source)"
                color="success"
                size="xs"
              >
                {{ $t('wallet.connected') }}
              </UBadge>
              <UButton
                color="secondary"
                :loading="connecting === wallet.source"
                :disabled="connecting === wallet.source"
                @click.stop="connectWallet(wallet.source)"
              >
                {{ connecting === wallet.source ? $t('wallet.connecting') : $t('wallet.connect') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <div v-if="installedWallets.length === 0" class="text-center py-6">
        <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary-100 dark:bg-secondary-900/20 flex items-center justify-center">
          <UIcon name="i-simple-icons-polkadot" class="w-6 h-6 text-secondary-600" />
        </div>
        <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {{ $t('wallet.noPolkadotWalletsFound') }}
        </h4>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t('wallet.installPolkadotWalletExtension') }}
        </p>
      </div>

      <div v-if="uninstalledWallets.length > 0" class="border-t border-gray-200 dark:border-gray-700 pt-3">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          block
          class="justify-between"
          @click="showUninstalled = !showUninstalled"
        >
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('wallet.otherWallets') }} ({{ uninstalledWallets.length }})
          </span>
          <UIcon
            :name="showUninstalled ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="w-4 h-4"
          />
        </UButton>

        <div v-if="showUninstalled" class="mt-3 space-y-2">
          <UCard
            v-for="wallet in uninstalledWallets"
            :key="wallet.source"
            class="opacity-60"
          >
            <div class="flex items-center justify-between p-3">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="wallet.icon"
                    :src="wallet.icon"
                    :alt="`${wallet.name} logo`"
                    class="w-6 h-6 object-contain"
                  >
                  <UIcon v-else name="i-lucide-download" class="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <div class="font-medium text-gray-700 dark:text-gray-300">
                    {{ wallet.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('wallet.notInstalled') }}
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
                  {{ $t('wallet.install') }}
                </UButton>
              </a>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
