<script setup lang="ts">
const {
  walletConnectModalOpen,
  walletAccountModalOpen,
} = storeToRefs(usePreferencesStore())
</script>

<template>
  <div>
    <client-only>
      <WalletDropdown
        @open-wallet="walletConnectModalOpen = true"
        @open-asset="walletAccountModalOpen = true"
      />
      <template #fallback>
        <div class="flex items-center justify-center">
          <USkeleton class="h-10 w-[160px] rounded-full" />
        </div>
      </template>
    </client-only>

    <!-- Wallet Asset Modal -->
    <WalletAssetModal
      v-model="walletAccountModalOpen"
    />

    <!-- Wallet Connect Modal -->
    <LazyWalletConnectModal
      v-model="walletConnectModalOpen"
      @close="walletConnectModalOpen = false"
      @select="walletConnectModalOpen = false"
    />
  </div>
</template>
