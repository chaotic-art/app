<script setup lang="ts">
import type { proccessData } from './utils/useTopCollections'
import type { AssetHubChain } from '~/types/chain'

const props = defineProps<{
  collection?: Awaited<ReturnType<typeof proccessData>>[number]
  chain: AssetHubChain
}>()

const { volume } = useCollectionVolume(
  props.collection,
  ref('All'),
)

const item = {
  id: props.collection?.id || '',
  name: props.collection?.name || '',
  image: props.collection?.image || '',
  issuer: props.collection?.issuer || '',
  currentOwner: props.collection?.currentOwner || '',
  metadata: props.collection?.metadata || null,
  isPlaceholder: false,
}
</script>

<template>
  <CollectionCard :item="item" :chain="chain" :volume="volume?.toString()" />
</template>
