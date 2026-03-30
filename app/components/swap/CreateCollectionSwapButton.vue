<script lang="ts" setup>
import type { AssetHubChain } from '~/types/chain'

const props = defineProps<{
  collectionId: string
}>()

const { $i18n } = useNuxtApp()

const collectionId = computed(() => props.collectionId)
const swapStore = useAtomicSwapStore()
const { currentChain } = useChain()

const { collection } = useOdaCollection(collectionId)

function onCreateCollectionSwapClick() {
  const swap = swapStore.createSwap(collectionId.value, currentChain.value as AssetHubChain, {
    isCollectionSwap: true,
    desired: [
      {
        id: '',
        collectionId: Number(collectionId.value),
        name: $i18n.t('swap.anyNftFromCollection', [collection.value?.metadata?.name || '']),
        sn: null,
        meta: {
          image: collection.value?.metadata?.image || '',
        },
      },
    ],
  })

  navigateToSwap(swap)
}
</script>

<template>
  <UButton
    variant="outline"
    :disabled="!collection"
    @click="onCreateCollectionSwapClick"
  >
    {{ $t('swap.createCollectionSwap') }}
  </UButton>
</template>
