<script setup lang="ts">
import { useSortOptions } from '~/composables/useSortOptions'

const props = defineProps<{
  collectionId: string
}>()

const { selectedSort, createQueryVariables } = useSortOptions()

const queryVariables = computed(() =>
  createQueryVariables([props.collectionId]),
)
</script>

<template>
  <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-0">
    <p class="text-2xl md:text-3xl font-bold font-serif italic text-center md:text-left">
      Latest NFT Mints
    </p>

    <div class="w-full md:w-auto">
      <SortOptions
        v-model="selectedSort"
        class="w-full md:w-48"
      />
    </div>
  </div>

  <!-- items -->
  <LazyNftsGrid
    :key="selectedSort + collectionId"
    :variables="queryVariables"
    class="mt-6 md:mt-10"
    grid-class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
  />
</template>
