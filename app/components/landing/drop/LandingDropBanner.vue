<script setup lang="ts">
import { getDrops } from '@/services/fxart'
import { getDropAttributes } from '~/components/drops/utils'

const { data: dropItems } = await useLazyAsyncData(() => (getDrops({
  active: [true],
  chain: ['ahp'],
  limit: 3,
})), {
  transform: async (data) => {
    return await Promise.all(data.map(async (drop) => {
      const formattedDrop = await getDropAttributes(drop.alias)
      return formattedDrop
    }))
  },
})

const mainDrop = computed(() => dropItems.value?.[0])
const subDrops = computed(() => dropItems.value?.slice(1, 3))
</script>

<template>
  <div class="flex flex-col mb-12 md:mb-[75px] px-4 md:px-0">
    <LandingHorizontalDropCard :drop="mainDrop" />

    <div class="flex flex-col md:flex-row gap-4 md:gap-6 mt-6 md:mt-8">
      <LandingSubDropCard v-for="subDrop in subDrops" :key="subDrop?.id" :drop="subDrop!" />
    </div>
  </div>
</template>
