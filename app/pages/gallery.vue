<template>
  <UContainer>
    <ClientOnly>
      <div>accounts: {{ accounts }}</div>

      <USeparator class="my-4" />

      <div> wallets: {{ wallets }}</div>
    </ClientOnly>
  </UContainer>
</template>
<script lang="ts" setup>
const { accounts } = storeToRefs(useAccountStore())
const { wallets } = storeToRefs(useWalletStore())

</script>
