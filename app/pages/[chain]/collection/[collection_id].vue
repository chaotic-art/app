<script setup lang="ts">
import { isSupportedChain } from '~/utils/chain'

definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isSupportedChain(chain)
  },
})
</script>

<template>
  <NuxtPage />
</template>
