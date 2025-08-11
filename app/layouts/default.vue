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
  <div class="min-h-full flex flex-col">
    <Navbar />

    <main class="grow">
      <div class="container-fluid">
        <slot />
      </div>
    </main>
    <LazyFooter />
  </div>
</template>
