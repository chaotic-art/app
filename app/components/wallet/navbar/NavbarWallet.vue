<script setup lang="ts">
const { walletConnectModalOpen } = storeToRefs(usePreferencesStore())

const route = useRoute()
const { walletAssetModal } = useWalletSidebar()

// Auto-close slide over when navigating to different pages
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (oldPath && newPath !== oldPath) {
      walletAssetModal.close()
    }
  },
)
</script>

<template>
  <div>
    <client-only>
      <WalletDropdown
        @open-wallet="walletConnectModalOpen = true"
        @open-asset="walletAssetModal.open"
      />
      <template #fallback>
        <div class="flex items-center justify-center">
          <USkeleton class="h-10 w-[160px] rounded-full" />
        </div>
      </template>
    </client-only>

    <!-- Wallet Connect Modal -->
    <LazyWalletConnectModal
      v-model="walletConnectModalOpen"
      @close="walletConnectModalOpen = false"
      @select="walletConnectModalOpen = false"
    />
  </div>
</template>
