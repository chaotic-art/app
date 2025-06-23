<script setup lang="ts">
import type { ChainVM } from '@kodadot1/static'
import type { SetWalletParams } from '@/stores/wallet'
import { useAccountStore } from '@/stores/account'
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()
const accountStore = useAccountStore()

const isWalletModalOpen = ref(false)

function openWalletModal() {
  isWalletModalOpen.value = true
}

function closeWalletModal() {
  isWalletModalOpen.value = false
}

function onSelectAccount({ vm, account }: SetWalletParams) {
  walletStore.setWallet({ vm, account })
  accountStore.setAuth({ vm, address: account.address })
  isWalletModalOpen.value = false
}

function onDisconnectAccount(vm: ChainVM) {
  accountStore.clearAuth(vm)
}
</script>

<template>
  <div>
    <client-only>
      <WalletDropdown
        @open-wallet-modal="openWalletModal"
      />
      <template #fallback>
        <div class="flex items-center justify-center">
          <USkeleton class="h-10 w-[160px] rounded-full" />
        </div>
      </template>
    </client-only>

    <WalletModal
      v-model="isWalletModalOpen"
      @select="onSelectAccount"
      @disconnect="onDisconnectAccount"
      @close="closeWalletModal"
    />
  </div>
</template>
