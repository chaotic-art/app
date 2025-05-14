<script lang="ts" setup>
const { $config } = useNuxtApp()
const route = useRoute()

useHead({
  link: [
    {
      hid: 'canonical',
      rel: 'canonical',
      href: $config.public.baseUrl + route.path,
    },
  ],
})
</script>

<template>
  <div class="min-h-full flex flex-col overflow-hidden">
    <!-- <Navbar /> -->
    <main class="grow">
      <Error
        v-if="$nuxt.isOffline"
        :has-img="false"
        error-title="Offline Detected"
        error-subtitle="Please check your network connections"
      />
      <NuxtPage v-else />
    </main>
    <LazyFooter />
  </div>
</template>
