<script setup lang="ts">
import { isAssetHubChain } from '~/utils/chain'

definePageMeta({
  title: 'Transfer',
  layout: 'default',
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isAssetHubChain(chain)
  },
})
</script>

<template>
  <Transfer />
</template>
