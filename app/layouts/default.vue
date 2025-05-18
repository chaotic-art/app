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

    <main class="grow py-8">
      <div class="container-fluid">
        <slot />
      </div>
    </main>
    <LazyFooter />
  </div>
</template>
