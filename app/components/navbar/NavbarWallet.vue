<script setup lang="ts">
import type { SetWalletParams } from '@/stores/wallet'

const walletStore = useWalletStore()
const isWalletModalOpen = ref(false)
const selectedWalletType = ref<'EVM' | 'SUB' | undefined>(undefined)

function openWalletModal(type?: 'EVM' | 'SUB') {
  selectedWalletType.value = type
  isWalletModalOpen.value = true
}

function onWalletTypeSelected(type: 'EVM' | 'SUB') {
  selectedWalletType.value = type
  openWalletModal(type)
}

function onSelectAccount({ vm, account }: SetWalletParams) {
  walletStore.setWallet({ vm, account })
  isWalletModalOpen.value = false
}
</script>

<template>
  <div>
    <client-only>
      <div>
        <WalletDropdown
          @select-wallet-type="onWalletTypeSelected"
        />
      </div>
    </client-only>

    <!-- Wallet Modal -->
    <UModal v-model:open="isWalletModalOpen">
      <template #content>
        <WalletModalContent
          :initial-wallet-type="selectedWalletType"
          @select="onSelectAccount"
        />
      </template>
    </UModal>
  </div>
</template>
