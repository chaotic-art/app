<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { normalizeRarityTotalItems } from '~/types/rarity'

const props = defineProps<{
  collectionId: string
  chain: AssetHubChain
}>()

const collectionIdRef = toRef(props, 'collectionId')
const { collection } = useOdaCollection(collectionIdRef)

const { buildOrderBy, sortOptions } = useSortOptions('collectionItems')
const { viewMode: nftViewMode, gridClass: nftGridClass } = useNftViewMode('collection')

const defaultSortKeys = computed(() => [sortOptions.value[0]?.value ?? 'recent'])
const queryVariables = computed(() => ({
  collections: [props.collectionId],
  orderBy: buildOrderBy(defaultSortKeys.value),
}))

const collectionRarityTotalItems = computed(() =>
  normalizeRarityTotalItems(collection.value?.supply),
)
</script>

<template>
  <LazyNftsGrid
    :variables="queryVariables"
    :grid-class="nftGridClass"
    :view-mode="nftViewMode"
    no-items-found-message="This collection doesn't have any items yet."
    :prefix="chain"
    :rarity-total-items="collectionRarityTotalItems"
    show-rarity
  />
</template>
