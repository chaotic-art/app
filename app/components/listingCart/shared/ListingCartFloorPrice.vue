<script setup lang="ts">
defineProps<{
  showCollectionFloorPrice?: boolean
}>()

const rate = ref(0)

const listingCartStore = useListingCartStore()

const isDisabled = computed(
  () =>
    !listingCartStore.isFloorPriceExisting,
)

watch(rate, rate => listingCartStore.setFloorPrice(rate))
</script>

<template>
  <div class="flex flex-col gap-2">
    <h3 v-if="showCollectionFloorPrice" class="text-gray-900 dark:text-white">
      Collection Floor Price
      <span
        v-if="rate !== 1"
        class="text-gray-500 dark:text-gray-400"
      >{{ (rate * 100 - 100).toFixed(0) }}%</span>
    </h3>

    <div class="flex gap-3">
      <UButton
        variant="outline"
        color="primary"
        class="py-2 px-4 rounded-full"
        size="lg"
        :disabled="isDisabled"
        @click="rate -= 0.05"
      >
        -5%
      </UButton>

      <UButton
        variant="outline"
        color="primary"
        class="py-2 px-4 rounded-full"
        size="lg"
        :disabled="isDisabled"
        @click="rate = 1"
      >
        Floor Price
      </UButton>

      <UButton
        variant="outline"
        color="primary"
        size="lg"
        class="py-2 px-4 rounded-full"
        :disabled="isDisabled"
        @click="rate += 0.05"
      >
        +5%
      </UButton>
    </div>
  </div>
</template>
