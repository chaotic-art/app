<script setup lang="ts">
const isOpen = defineModel<boolean>({ required: true })
const route = useRoute()

watch(route, () => {
  if (isOpen.value) {
    isOpen.value = false
  }
})
</script>

<template>
  <div>
    <USlideover
      v-model:open="isOpen"
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
