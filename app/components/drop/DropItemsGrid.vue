<script setup lang="ts">
const props = defineProps<{
  collectionId: string
}>()

const selectedSort = ref('newest')

const queryVariables = computed(() => ({
  collections: [props.collectionId],
}))
</script>

<template>
  <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-0">
    <p class="text-2xl md:text-3xl font-bold font-serif italic text-center md:text-left">
      Latest NFT Mints
    </p>

    <div class="flex gap-2 md:gap-4">
      <UButton class="rounded-full px-3 md:px-4 py-2 text-sm" label="Newest" variant="outline" />
      <UButton class="rounded-full px-3 md:px-4 py-2 text-sm" label="Buy Now" variant="outline" />
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
