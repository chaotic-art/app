<script setup lang="ts">
import type { ListingCartItem } from '~/stores/listingCart'

const props = defineProps<{
  item: ListingCartItem
}>()

const listingCartStore = useListingCartStore()
const floorPrice = computed(() => Number(props.item.collection.floor) || 0)

const listPrice = computed({
  get() {
    return Number(props.item.listPrice) || ''
  },
  set(value) {
    listingCartStore.updateItem({ id: props.item.id, listPrice: Number(value) })
  },
})
</script>

<template>
  <div class="bg-secondary">
    <CartItemDetails
      class="mb-5"
      :name="item.name"
      :image="item.metadata?.image"
      :collection-name="item.collection?.name"
      :price="item.price"
    />

    <!-- Floor Price Section -->
    <div v-if="floorPrice" class="flex justify-between items-center">
      <span class="text-gray-900 dark:text-white font-medium">Floor Price</span>
      <Money class="text-gray-900 dark:text-white font-medium" :value="floorPrice" inline />
    </div>

    <USeparator class="my-4" />

    <!-- Choose a price section -->
    <div class="space-y-4">
      <h3 class="font-bold text-gray-900 dark:text-white">
        Choose a price
      </h3>

      <ListingCartFloorPrice />

      <ListingCartPriceInput v-model="listPrice" />
    </div>
  </div>
</template>
