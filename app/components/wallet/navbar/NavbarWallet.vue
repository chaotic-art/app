<script setup lang="ts">
import { LazyWalletAssetModal } from '#components'

const {
  walletConnectModalOpen,
} = storeToRefs(usePreferencesStore())

const route = useRoute()

const overlay = useOverlay()
const slideover = overlay.create(LazyWalletAssetModal)

function openWalletAssetModal() {
  slideover.open()
}

// Auto-close slide over when navigating to different pages
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (oldPath && newPath !== oldPath) {
      slideover.close()
    }
  },
)
</script>

<template>
  <div>
    <client-only>
      <WalletDropdown
        @open-wallet="walletConnectModalOpen = true"
        @open-asset="openWalletAssetModal"
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
