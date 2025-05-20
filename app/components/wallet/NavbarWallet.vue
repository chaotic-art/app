<script setup lang="ts">
import type { SetWalletParams } from '@/stores/wallet'
import type { ChainVM } from '@kodadot1/static'

const walletStore = useWalletStore()
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
  isWalletModalOpen.value = false
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
        />
      </template>
    </UModal>
  </div>
</template>
