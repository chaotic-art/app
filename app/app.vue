<script lang="ts" setup>
const fiatStore = useFiatStore()

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
    <LazyShoppingCartModal />
    <LazyConfirmPurchaseModal />
    <LazyListingCartModal />
  </UApp>
</template>
