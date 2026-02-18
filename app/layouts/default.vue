<script lang="ts" setup>
const { $config } = useNuxtApp()
const route = useRoute()

useHead({
  link: [
    {
      rel: 'canonical',
      href: $config.public.baseUrl + route.path,
    },
  ],
})
</script>

<template>
  <div class="min-h-full flex flex-col overflow-hidden">
    <Navbar />

    <main class="grow">
      <slot />
    </main>
    <LazyFooter />

    <!-- Connection status pill (bottom-left, per design review) -->
    <div class="fixed bottom-4 left-4 z-40">
      <RpcProviderSwitcher />
    </div>
  </div>
</template>
