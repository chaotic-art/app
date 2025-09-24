<script setup lang="ts">
import type { DropItem } from '@/types/drop'
import { getEnrichedDrop } from '@/components/drop/utils'

const { data: dropItems } = await useFetch('/api/genart/list', {
  query: {
    limit: 3,
  },
  transform: async (data) => {
    const now = new Date()
    const futureDrops = data.data
      .filter(drop => drop.start_at && new Date(drop.start_at).getTime() > now.getTime())
      .sort((a, b) => new Date(a.start_at!).getTime() - new Date(b.start_at!).getTime())
    const pastDrops = data.data.filter(drop => drop.start_at && new Date(drop.start_at).getTime() <= now.getTime())
    const latestDrops = [...futureDrops, ...pastDrops]
    return await Promise.all(latestDrops.map(getEnrichedDrop))
  },
})

function onDropClick(drop: DropItem) {
  navigateTo(drop.isMintedOut ? `/${drop?.chain}/collection/${drop?.collection}` : `/${drop?.chain}/drops/${drop?.alias}`)
}

const subDrops = computed(() => dropItems.value?.slice(1, 3))
</script>

<template>
  <div class="flex flex-col mb-12 xl:mb-[75px] px-4 xl:px-0">
    <LandingHorizontalDropCard
      :drop="dropItems?.[0]"
      @click="onDropClick"
    />

    <div v-if="subDrops" class="flex flex-col xl:flex-row gap-4 xl:gap-6 mt-6 xl:mt-8">
      <LandingSubDropCard
        v-for="subDrop in subDrops"
        :key="subDrop?.alias"
        :drop="subDrop"
        @click="onDropClick"
      />
    </div>
    <div v-else class="flex flex-col md:flex-row gap-4 md:gap-6 mt-6 md:mt-8">
      <div class="w-full h-[440px] bg-gray-200 dark:bg-neutral-800 animate-pulse rounded-xl" />
      <div class="w-full h-[440px] bg-gray-200 dark:bg-neutral-800 animate-pulse rounded-xl" />
    </div>
  </div>
</template>
