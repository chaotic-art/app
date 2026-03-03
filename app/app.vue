<script lang="ts" setup>
const fiatStore = useFiatStore()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const requestURL = useRequestURL()

const canonicalHref = computed(() => {
  const configuredSiteUrl = String(runtimeConfig.public.siteUrl ?? '').trim().replace(/\/+$/, '')
  const fallbackOrigin = requestURL.origin.trim().replace(/\/+$/, '')
  const base = configuredSiteUrl || fallbackOrigin

  try {
    return base ? new URL(route.path || '/', `${base}/`).toString() : (route.path || '/')
  }
  catch {
    return route.path || '/'
  }
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
