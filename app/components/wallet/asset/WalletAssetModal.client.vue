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

          <hr class="my-4">

          <!-- Balances -->
          <WalletAssetBalances />
        </div>
      </template>

      <template #footer>
        <div>
          <ThemeSwitcher show-label />
        </div>
      </template>
    </USlideover>
  </div>
</template>
