<script setup lang="ts">
const walletStore = useWalletStore()
const { logoutConnectedWallets, backToWalletSelection } = useWalletManager()

const { getUserConnectedWallets: connectedWallets } = storeToRefs(walletStore)

function handleManageWallets() {
  walletStore.clearSelectedWallets()
  backToWalletSelection()
}

function handleLogout() {
  logoutConnectedWallets()
}
</script>

<template>
  <div class="flex flex-wrap gap-2 items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
    <div v-if="connectedWallets.length" class="flex items-center space-x-3">
      <StackedWallets :wallets="connectedWallets" :max-visible="2" size="sm" />

      <div class="text-sm text-gray-600 dark:text-gray-400 capitalize">
        {{ $t('wallet.connected_count', { count: connectedWallets.length }) }}
      </div>
    </div>
    <span v-else />

    <div class="flex items-center space-x-2">
      <UButton
        color="error"
        variant="soft"
        size="sm"
        icon="i-lucide-log-out"
        @click="handleLogout"
      >
        {{ $t('wallet.logOut') }}
      </UButton>

      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        @click="handleManageWallets"
      >
        {{ $t('wallet.manageWallets') }}
      </UButton>
    </div>
  </div>
</template>
