<script setup lang="ts">
import { useFiatStore } from '@/stores/fiat'
// import TopCollectionsCard from './TopCollectionsCard.vue'
// import { useTopCollections } from './utils/useTopCollections'

// const limit = 8

// const { data } = useTopCollections(limit)
const fiatStore = useFiatStore()

onMounted(() => {
  if (fiatStore.getCurrentKSMValue) {
    fiatStore.fetchFiatPrice()
  }
})
</script>

<template>
  <!-- {{ data }} -->
  <section class="pt-8 md:pt-16 px-4 md:px-0">
    <div class="text-2xl md:text-[50px] font-serif italic font-medium mb-4 md:mb-8 text-center md:text-left">
      {{ $t('collection.topCollections') }}
    </div>
    <div class="">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <!-- <TopCollectionsCard v-for="(collection, i) in data" :key="i" :collection="collection" /> -->
      </div>
      <div class="flex justify-center mt-6 md:mt-8">
        <UButton class="bg-white text-black border border-[#D9D9D9] rounded-full px-6 py-2 md:px-8">
          {{ $t('collection.viewMore') }}
        </UButton>
      </div>
    </div>
  </section>
</template>
