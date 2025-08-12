<script setup lang="ts">
import { DEFAULT_FLOOR_PRICE_RATE } from '@/stores/listingCart'

const rate = ref(DEFAULT_FLOOR_PRICE_RATE)

const listingCartStore = useListingCartStore()

watch(rate, rate => listingCartStore.setFloorPrice(rate))
</script>

<template>
  <div class="flex gap-3">
    <UButton
      variant="outline"
      color="primary"
      class="py-2 px-4 rounded-full"
      size="lg"
      @click="rate -= 0.05"
    >
      -5%
    </UButton>

    <UButton
      variant="outline"
      color="primary"
      class="py-2 px-4 rounded-full"
      size="lg"
      @click="rate = 1"
    >
      Floor Price
    </UButton>

    <UButton
      variant="outline"
      color="primary"
      size="lg"
      class="py-2 px-4 rounded-full"
      @click="rate += 0.05"
    >
      +5%
    </UButton>
  </div>
</template>
