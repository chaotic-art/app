<script setup lang="ts">
import type { AssetHubChain } from '~/types/chain'
import TopCollectionsCard from './TopCollectionsCard.vue'
import { useTopCollections } from './utils/useTopCollections'

const limit = 12
const { currentChain } = useChain()
const chain = computed(() => currentChain.value as AssetHubChain)
const { data } = useTopCollections(limit, chain)
const fiatStore = useFiatStore()

onMounted(() => {
  if (fiatStore.getCurrentKSMValue) {
    fiatStore.fetchFiatPrice()
  }
})
</script>

<template>
  <section class="py-16 md:pt-16 md:px-0">
    <h2 class="text-2xl md:text-[50px] font-serif italic font-medium mb-4 md:mb-8 text-center md:text-left text-foreground">
      {{ $t('collection.topCollections') }}
    </h2>
    <div class="">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <TopCollectionsCard v-for="(collection, i) in data" :key="i" :collection="collection" :chain="chain" />
      </div>
      <div class="flex justify-center mt-6 md:mt-8">
        <UButton :to="`/${currentChain}/explore/collectibles`" class="rounded-full" variant="outline">
          {{ $t('collection.viewMore') }}
        </UButton>
      </div>
    </div>
  </section>
</template>
