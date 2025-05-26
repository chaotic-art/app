<script lang="ts" setup>
import type { DropItem } from '@/types'
import { getDropAttributes } from './utils'

const props = defineProps<{
  drop: DropItem
  showMinted?: boolean
}>()

const formattedDrop = ref<DropItem>()

// const shouldShowDrop = computed(() =>
//   props.showMinted || (!formattedDrop.value?.isMintedOut),
// )

onBeforeMount(async () => {
  formattedDrop.value = await getDropAttributes(props.drop.alias)

  if (formattedDrop.value?.isMintedOut) {
    // useMintedDropsStore().addMintedDrop(formattedDrop.value)
  }
})
</script>

<template>
  <div>
    <slot :drop="formattedDrop" />
  </div>
</template>
