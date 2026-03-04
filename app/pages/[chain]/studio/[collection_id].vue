<script setup lang="ts">
import { isAssetHubChain } from '~/utils/chain'

definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isAssetHubChain(chain)
  },
})

useSeoMeta({
  title: 'Manage Collection - Studio',
  description: 'Manage your NFT collection.',
})
</script>

<template>
  <UContainer class="px-4 py-8 md:px-6" />
</template>
