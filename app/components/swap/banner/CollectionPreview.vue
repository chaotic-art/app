<script lang="ts" setup>
import { sanitizeIpfsUrl } from '@/utils/ipfs'

const props = defineProps<{
  collectionId: string
}>()

const { currentChain } = useChain()

const { collection } = useOdaCollection(computed(() => props.collectionId))
</script>

<template>
  <div class="p-1 bg-secondary inline-block rounded-full h-[60px]">
    <NuxtLink v-if="collection" :to="`/${currentChain}/collection/${collectionId}`" class="flex items-center gap-2 rounded-full w-fit h-full min-w-0 bg-secondary hover:bg-ring px-2">
      <div class="rounded-full overflow-hidden bg-background shrink-0 h-10 aspect-square p-[3px]">
        <img :src="sanitizeIpfsUrl(collection.metadata?.image)" sizes="40px" :title="collection.metadata?.name" class="object-cover rounded-full h-full w-full">
      </div>

      <span class="text-ellipsis overflow-hidden whitespace-nowrap">{{ collection.metadata?.name }}</span>
    </NuxtLink>
  </div>
</template>
