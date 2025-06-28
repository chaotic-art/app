<script setup lang="ts">
const { isModalOpen } = storeToRefs(useWalletStore())
</script>

<template>
  <div>
    <client-only>
      <WalletDropdown
        @open="isModalOpen = true"
      />
      <template #fallback>
        <div class="flex items-center justify-center">
          <USkeleton class="h-10 w-[160px] rounded-full" />
        </div>
      </template>
    </client-only>

    <WalletModal
      v-model="isModalOpen"
      @close="isModalOpen = false"
    />
  </div>
</template>
