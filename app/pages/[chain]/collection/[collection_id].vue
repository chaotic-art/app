<script setup lang="ts">
import { CHAINS } from '@kodadot1/static'

definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && chain in CHAINS
  },
})
</script>

<template>
  <NuxtPage />
</template>
