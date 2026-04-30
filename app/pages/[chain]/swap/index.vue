<script lang="ts" setup>
import { isAssetHubChain } from '~/utils/chain'

definePageMeta({
  layout: 'no-footer',
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isAssetHubChain(chain)
  },
})

useSeoMeta({
  title: 'Swap NFTs',
  ogTitle: 'Swap NFTs',
  description: 'Trade NFTs on Chaotic marketplace',
  ogDescription: 'Trade NFTs on Chaotic marketplace',
})
</script>

<template>
  <SwapLanding />
</template>
