<script setup lang="ts">
import CreateNftMintForm from '~/components/create/NftMintForm.vue'
import { isAssetHubChain } from '~/utils/chain'

definePageMeta({
  layout: 'studio-collection',
  validate: async (route) => {
    const { chain, collection_id } = route.params
    return (
      typeof chain === 'string'
      && isAssetHubChain(chain)
      && typeof collection_id === 'string'
    )
  },
})

const route = useRoute()
const { currentChain } = useChain()

const collectionId = computed(() => route.params.collection_id as string)
</script>

<template>
  <CreateNftMintForm
    :fixed-collection-id="collectionId"
    :fixed-blockchain="currentChain"
  />
</template>
