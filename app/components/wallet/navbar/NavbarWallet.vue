<script setup lang="ts">
const isWalletModalOpen = ref(false)

function openWalletModal() {
  isWalletModalOpen.value = true
}

function closeWalletModal() {
  isWalletModalOpen.value = false
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
      @close="closeWalletModal"
    />
  </div>
</template>
