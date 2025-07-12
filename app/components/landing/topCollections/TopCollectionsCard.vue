<script setup lang="ts">
import type { proccessData } from './utils/useTopCollections'

const props = defineProps<{
  collection?: Awaited<ReturnType<typeof proccessData>>[number]
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
  <CollectionCard :item="item" :volume="volume?.toString()" />
</template>
