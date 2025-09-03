<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
  <USlideover
    :close="{ onClick: () => emit('close', false) }"
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
      <div>
        <ThemeSwitcher show-label />
      </div>
    </template>
  </USlideover>
</template>
