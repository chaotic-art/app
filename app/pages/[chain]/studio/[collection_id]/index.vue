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

const route = useRoute()
const { currentChain } = useChain()

await navigateTo({
  path: `/${currentChain.value}/studio/${route.params.collection_id}/preview`,
  replace: true,
})
</script>

<template>
  <div />
</template>
