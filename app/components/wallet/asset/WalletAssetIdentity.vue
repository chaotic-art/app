<script setup lang="ts">
import { copyAddress } from '~/utils/format/address'

const { accountId } = useAuth()
const { walletConnectModalOpen } = storeToRefs(usePreferencesStore())
const { walletAssetModal } = useWalletSidebar()
const { logoutConnectedWallets } = useWalletManager()

async function handleCopyAddress() {
  if (accountId.value) {
    await copyAddress(accountId.value)
  }
}

function handleLogout() {
  logoutConnectedWallets()
  walletAssetModal.close()
}

function handleWalletSettings() {
  walletAssetModal.close()
  walletConnectModalOpen.value = true
}
</script>

<template>
  <div class="flex items-center justify-between">
    <UserInfo v-if="accountId" :avatar-size="40" :address="accountId" :transparent-background="true" class="min-w-0" custom-name>
      <template #name="{ addressName }">
        <div class="flex flex-col">
          <span class="text-sm font-medium text-foreground">{{ addressName }}</span>
          <span
            class="text-xs text-muted-foreground"
          >
            View my profile
          </span>
        </div>
      </template>
    </UserInfo>

    <div class="flex items-center gap-2">
      <UButton
        variant="ghost"
        size="sm"
        square
        title="Copy address"
        class="self-center size-8"
        @click="handleCopyAddress"
      >
        <UIcon name="i-lucide-copy" class="w-4 h-4" />
      </UButton>

      <UButton
        variant="ghost"
        size="sm"
        square
        title="Manage wallet"
        class="self-center size-8"
        @click="handleWalletSettings"
      >
        <UIcon name="i-lucide-settings" class="w-4 h-4" />
      </UButton>
      <UButton
        variant="ghost"
        size="sm"
        square
        title="Manage wallet"
        class="self-center size-8"
        @click="handleLogout"
      >
        <UIcon name="i-lucide-log-out" class="w-4 h-4" />
      </UButton>
    </div>
  </div>
</template>
