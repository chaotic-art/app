<script setup lang="ts">
import { copyAddress } from '~/utils/format/address'

const { accountId } = useAuth()
const { walletConnectModalOpen, walletAccountModalOpen } = storeToRefs(usePreferencesStore())

async function handleCopyAddress() {
  if (accountId.value) {
    await copyAddress(accountId.value)
  }
}

function handleWalletSettings() {
  walletAccountModalOpen.value = false
  walletConnectModalOpen.value = true
}
</script>

<template>
  <div class="flex items-center justify-between">
    <UserInfo :avatar-size="40" :address="accountId" :transparent-background="true" class="min-w-0">
      <template #footer>
        <div class="text-xs">
          {{ $t('viewProfile') }}
        </div>
      </template>
    </UserInfo>

    <div class="flex items-center gap-2">
      <UButton
        variant="ghost"
        size="sm"
        square
        :title="$t('copyAddress')"
        class="self-center"
        @click="handleCopyAddress"
      >
        <UIcon name="i-lucide-copy" class="w-4 h-4" />
      </UButton>

      <UButton
        variant="ghost"
        size="sm"
        square
        :title="$t('wallet.manage')"
        class="self-center"
        @click="handleWalletSettings"
      >
        <UIcon name="i-lucide-settings" class="w-4 h-4" />
      </UButton>
    </div>
  </div>
</template>
