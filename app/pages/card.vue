<script setup lang="ts">
const title = 'Chaotic Cards'

definePageMeta({
  title,
  layout: 'empty',
})

useSeoMeta({
  title,
  description: () => `The Polkadot ecosystem has always been about innovation, freedom, and community. Now it’s time to capture that energy in a new way: Chaotic Cards.`,
  ogImage: () => toOriginalContentUrl(sanitizeIpfsUrl('ipfs://QmTUB5xvkGqHKK6Ew6Hbhs4YpgV29wt8FmZqmccEG5sMpg')),
})
</script>

<template>
  <CardPage />
</template>
