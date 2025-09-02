<script setup lang="ts">
const value = defineModel<boolean>({ required: true })
</script>

<template>
  <div>
    <USlideover
      v-model:open="value"
      title="Profile"
      side="right"
      :ui="{
        content: 'w-full md:max-w-[380px]',
      }"
    >
      <template #body>
        <div class="flex flex-col">
          <!-- Identity -->
          <WalletAssetIdentity />

          <USeparator class="my-4" />

          <!-- Balances -->
          <AssetBalances />
        </div>
      </template>

      <template #footer>
        <WalletAssetFooter />
      </template>
    </USlideover>
  </div>
</template>
