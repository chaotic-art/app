<script setup lang="ts">
import { isAssetHubChain } from '~/utils/chain'

definePageMeta({
  layout: 'studio-collection',
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isAssetHubChain(chain)
  },
})
</script>

<template>
  <div />
</template>
