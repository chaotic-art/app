<script lang="ts" setup>
const { walletAccountModalOpen } = storeToRefs(usePreferencesStore())
const fiatStore = useFiatStore()
const route = useRoute()

onMounted(async () => {
  if (fiatStore.incompleteFiatValues) {
    fiatStore.fetchFiatPrice()
  }
})

watch(() => route.path, () => {
  if (walletAccountModalOpen.value) {
    walletAccountModalOpen.value = false
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
