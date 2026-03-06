<script setup lang="ts">
import { isAssetHubChain } from '~/utils/chain'

definePageMeta({
  layout: 'studio-collection',
  validate: async (route) => {
    const { chain, collection_id: collectionId } = route.params
    return (
      typeof chain === 'string'
      && isAssetHubChain(chain)
      && typeof collectionId === 'string'
      && /^\d+$/.test(collectionId)
    )
  },
})
</script>

<template>
  <div />
</template>
