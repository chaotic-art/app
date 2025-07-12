<script setup lang="ts">
const value = defineModel<boolean>({ required: true })
</script>

<template>
  <div>
    <USlideover
      v-model:open="value"
      title="Profile"
      side="right"
    >
      <template #body>
        <!-- Balances -->
        <WalletAssetBalances />
      </template>
    </USlideover>
  </div>
</template>
