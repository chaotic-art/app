<script lang="ts" setup>
const fiatStore = useFiatStore()
const subWalletStore = useSubWalletStore()

if (import.meta.client) {
  subWalletStore.init()
}

onMounted(async () => {
  if (fiatStore.incompleteFiatValues) {
    fiatStore.fetchFiatPrice()
  }
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <LazyTransactionModal />
  </UApp>
</template>
