<script setup lang="ts">
const { isModalOpen } = storeToRefs(useWalletStore())

const isWalletAssetModalOpen = ref(false)
</script>

<template>
  <div>
    <client-only>
      <WalletDropdown
        @open-wallet="isModalOpen = true"
        @open-asset="isWalletAssetModalOpen = true"
      />
      <template #fallback>
        <div class="flex items-center justify-center">
          <USkeleton class="h-10 w-[160px] rounded-full" />
        </div>
      </template>
    </client-only>

    <!-- Wallet Asset Modal -->
    <WalletAssetModal
      v-model="isWalletAssetModalOpen"
    />

    <!-- Wallet Connect Modal -->
    <WalletModal
      v-model="isModalOpen"
      @close="isModalOpen = false"
    />
  </div>
</template>
