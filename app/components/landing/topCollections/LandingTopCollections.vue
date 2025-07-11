<script setup lang="ts">
import TopCollectionsCard from './TopCollectionsCard.vue'
import { useTopCollections } from './utils/useTopCollections'

const limit = 12
const { prefix } = usePrefix()
const { data } = useTopCollections(limit)
const fiatStore = useFiatStore()

onMounted(() => {
  if (fiatStore.getCurrentKSMValue) {
    fiatStore.fetchFiatPrice()
  }
})
</script>

<template>
  <section class="pt-8 md:pt-16 md:px-0 bg-background-color">
    <div class="text-2xl md:text-[50px] font-serif italic font-medium mb-4 md:mb-8 text-center md:text-left text-gray-900 dark:text-white">
      {{ $t('collection.topCollections') }}
    </div>
    <div class="">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <TopCollectionsCard v-for="(collection, i) in data" :key="i" :collection="collection" />
      </div>
      <div class="flex justify-center mt-6 md:mt-8">
        <UButton class="bg-background-color-secondary text-black dark:text-white border border-gray-300 dark:border-neutral-700 rounded-full px-6 py-2 md:px-8" :to="`/${prefix}/explore/collectibles`">
          {{ $t('collection.viewMore') }}
        </UButton>
      </div>
    </div>
  </section>
</template>
