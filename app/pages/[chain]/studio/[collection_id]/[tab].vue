<script setup lang="ts">
import CollectionHeader from '~/components/collection/CollectionHeader.vue'
import { isAssetHubChain } from '~/utils/chain'

const validTabs = ['preview', 'details', 'items'] as const

definePageMeta({
  layout: 'studio-collection',
  validate: async (route) => {
    const { chain, tab } = route.params
    return (
      typeof chain === 'string'
      && isAssetHubChain(chain)
      && typeof tab === 'string'
      && (validTabs as readonly string[]).includes(tab)
    )
  },
})

const route = useRoute()
const tab = computed(() => route.params.tab as (typeof validTabs)[number])
const collectionId = computed(() => route.params.collection_id as string)
const { currentChain } = useChain()
const { collection } = useOdaCollection(collectionId)
</script>

<template>
  <div>
    <CollectionHeader
      v-if="tab === 'preview'"
      :collection="collection ?? null"
      :collection-id="collectionId"
      :chain="currentChain"
    />
    <StudioCollectionDetails
      v-else-if="tab === 'details'"
      :collection-id="collectionId"
      :collection="collection ?? null"
    />
    <StudioCollectionItems
      v-else-if="tab === 'items'"
      :collection-id="collectionId"
      :chain="currentChain"
    />
  </div>
</template>
