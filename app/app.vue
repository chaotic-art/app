<script lang="ts" setup>
const fiatStore = useFiatStore()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const canonicalHref = computed(() => {
  return new URL(route.path || '/', `${runtimeConfig.public.siteUrl}/`).toString()
})

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      href: canonicalHref.value,
    },
  ],
}))

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
