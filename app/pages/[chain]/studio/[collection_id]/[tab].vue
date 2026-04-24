<script setup lang="ts">
import type { AssetHubChain } from '~/types/chain'
import CollectionHeader from '~/components/collection/CollectionHeader.vue'
import { isAssetHubChain } from '~/utils/chain'

const validTabs = ['preview', 'details', 'items', 'traits'] as const

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
const chain = computed(() => route.params.chain as AssetHubChain)
const { collection } = useOdaCollection(collectionId)
</script>

<template>
  <div>
    <CollectionHeader
      v-if="tab === 'preview'"
      :collection="collection ?? null"
      :collection-id="collectionId"
      :chain="chain"
    />
    <StudioCollectionDetails
      v-else-if="tab === 'details'"
      :collection-id="collectionId"
      :collection="collection ?? null"
    />
    <StudioCollectionItems
      v-else-if="tab === 'items'"
      :collection-id="collectionId"
    />
    <StudioCollectionTraits
      v-else-if="tab === 'traits'"
      :collection-id="collectionId"
    />
  </div>
</template>
