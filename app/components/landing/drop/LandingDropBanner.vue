<script setup lang="ts">
import type { DropItem } from '@/types/drop'
import { getEnrichedDrop } from '@/components/drop/utils'
import { getDrops } from '@/services/fxart'

const { prefix } = usePrefix()

const { data: dropItems } = await useLazyAsyncData(() => (getDrops({
  active: [true],
  chain: [isProduction ? 'ahp' : prefix.value],
  limit: 3,
})), {
  transform: async (data) => {
    return await Promise.all(data.map(getEnrichedDrop))
  },
})

const dropItemsFiltered = computed(() => (dropItems.value?.filter(Boolean) as DropItem[]) || [])

function onDropClick(drop: DropItem) {
  navigateTo(drop.isMintedOut ? `/${drop?.chain}/collection/${drop?.collection}` : `/${drop?.chain}/drops/${drop?.alias}`)
}

const subDrops = computed(() => dropItemsFiltered.value.slice(1, 3))
</script>

<template>
  <div class="mb-12 xl:mb-[75px]">
    <!-- Mobile: Carousel -->
    <div class="px-4 xl:px-0 block sm:hidden">
      <LandingDropCarousel :drops="dropItemsFiltered" @click="onDropClick" />
    </div>

    <!-- Desktop: Existing layout -->
    <div class="hidden sm:flex sm:flex-col px-4 xl:px-0">
      <LandingHorizontalDropCard
        :drop="dropItemsFiltered[0]"
        @click="onDropClick"
      />

      <div v-if="subDrops.length" class="flex flex-col xl:flex-row gap-4 xl:gap-6 mt-6 xl:mt-8">
        <LandingSubDropCard
          v-for="subDrop in subDrops"
          :key="subDrop?.id"
          :drop="subDrop"
          @click="onDropClick"
        />
      </div>
      <div v-else class="flex flex-col md:flex-row gap-4 md:gap-6 mt-6 md:mt-8">
        <div class="w-full h-[440px] bg-gray-200 dark:bg-neutral-800 animate-pulse rounded-xl" />
        <div class="w-full h-[440px] bg-gray-200 dark:bg-neutral-800 animate-pulse rounded-xl" />
      </div>
    </div>
  </div>
</template>
