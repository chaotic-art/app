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
  <section>
    <div class="text-center mb-12">
      <h2 class="text-3xl lg:text-4xl xl:text-5xl text-neutral-900 dark:text-white mb-6 leading-tight font-serif">
        Top <span class="text-neutral-500 italic">Collections</span>
      </h2>
      <p class="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
        Discover the most popular and trending NFT collections from our vibrant community of creators and collectors.
      </p>
    </div>
    <div class="">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <TopCollectionsCard v-for="(collection, i) in data" :key="i" :collection="collection" />
      </div>
      <div class="flex justify-center mt-6 md:mt-8">
        <UButton
          variant="outline"
          color="neutral"
          :to="`/${prefix}/explore/collectibles`"
          class="px-8 py-2 rounded-full"
        >
          Explore Collections
        </UButton>
      </div>
    </div>
  </section>
</template>
