<script setup lang="ts">
import { getDrops } from '@/services/fxart'
import { fetchOdaCollection } from '@/services/oda'

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

const subDrops = computed(() => dropItems.value?.slice(1, 3))
</script>

<template>
  <div class="flex flex-col mb-12 md:mb-[75px] px-4 md:px-0">
    <LandingHorizontalDropCard
      :drop="dropItems?.[0]"
      :description="dropItems?.[0]?.metadata?.description"
      :claimed="Number(dropItems?.[0]?.claimed)"
    />

    <div v-if="subDrops" class="flex flex-col md:flex-row gap-4 md:gap-6 mt-6 md:mt-8">
      <LandingSubDropCard
        v-for="subDrop in subDrops"
        :key="subDrop?.id"
        :drop="subDrop"
        :description="subDrop?.metadata?.description"
        :claimed="Number(subDrop?.claimed)"
      />
    </div>
    <div v-else class="flex flex-col md:flex-row gap-4 md:gap-6 mt-6 md:mt-8">
      <div class="w-full h-[440px] bg-gray-200 animate-pulse rounded-xl" />
      <div class="w-full h-[440px] bg-gray-200 animate-pulse rounded-xl" />
    </div>
  </div>
</template>
