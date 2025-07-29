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

    <TransactionModal />
  </UApp>
</template>
