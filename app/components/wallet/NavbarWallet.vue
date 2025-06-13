<script setup lang="ts">
import type { ChainVM } from '@kodadot1/static'
import type { SetWalletParams } from '@/stores/wallet'
import { useAccountStore } from '@/stores/account'
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()
const accountStore = useAccountStore()

const isWalletModalOpen = ref(false)
const selectedWalletType = ref<ChainVM | undefined>(undefined)

function openWalletModal(type: ChainVM) {
  selectedWalletType.value = type
  isWalletModalOpen.value = true
}

function onWalletTypeSelected(type: ChainVM) {
  selectedWalletType.value = type
  openWalletModal(type)
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
        @select-wallet-type="onWalletTypeSelected"
      />
      <template #fallback>
        <div class="flex items-center justify-center">
          <USkeleton class="h-10 w-[160px] rounded-full" />
        </div>
      </template>
    </client-only>

    <!-- Wallet Modal -->
    <UModal v-model:open="isWalletModalOpen">
      <template #content>
        <WalletModalContent
          :initial-wallet-type="selectedWalletType"
          @select="onSelectAccount"
          @disconnect="onDisconnectAccount"
        />
      </template>
    </UModal>
  </div>
</template>
