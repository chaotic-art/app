<script setup lang="ts">
import { isAssetHubChain } from '~/utils/chain'

definePageMeta({
  layout: 'default',
  title: 'Airdrop NFTs',
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isAssetHubChain(chain)
  },
})
</script>

<template>
  <div>
    <AirdropNft />
  </div>
</template>
