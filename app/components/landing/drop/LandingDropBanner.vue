<script setup lang="ts">
import type { OnchainCollection } from '@/services/oda'
import type { DropItem } from '@/types/drop'
import { getDrops } from '@/services/fxart'
import { fetchOdaCollection } from '@/services/oda'

type DropItemWithCollection = DropItem & OnchainCollection

const { data: dropItems } = await useLazyAsyncData(() => (getDrops({
  active: [true],
  chain: ['ahp'],
  limit: 3,
})), {
  transform: async (data) => {
    return await Promise.all(data.map(async (drop) => {
      const collection = await fetchOdaCollection('ahp', drop.collection)
      return {
        ...drop,
        ...collection,
      }
    }))
  },
})

function onDropClick(drop: DropItemWithCollection) {
  navigateTo(Number(drop.claimed) === drop.max ? `/${drop?.chain}/collection/${drop?.collection}` : `/${drop?.chain}/drops/${drop?.alias}`)
}

const subDrops = computed(() => dropItems.value?.slice(1, 3))
</script>

<template>
  <div class="flex flex-col mb-12 xl:mb-[75px] px-4 xl:px-0">
    <LandingHorizontalDropCard
      :drop="dropItems?.[0]"
      :description="dropItems?.[0]?.metadata?.description"
      :claimed="Number(dropItems?.[0]?.claimed)"
      @click="onDropClick"
    />

    <div v-if="subDrops" class="flex flex-col xl:flex-row gap-4 xl:gap-6 mt-6 xl:mt-8">
      <LandingSubDropCard
        v-for="subDrop in subDrops"
        :key="subDrop?.id"
        :drop="subDrop"
        :description="subDrop?.metadata?.description"
        :claimed="Number(subDrop?.claimed)"
        @click="onDropClick"
      />
    </div>
    <div v-else class="flex flex-col md:flex-row gap-4 md:gap-6 mt-6 md:mt-8">
      <div class="w-full h-[440px] bg-gray-200 dark:bg-neutral-800 animate-pulse rounded-xl" />
      <div class="w-full h-[440px] bg-gray-200 dark:bg-neutral-800 animate-pulse rounded-xl" />
    </div>
  </div>
</template>
