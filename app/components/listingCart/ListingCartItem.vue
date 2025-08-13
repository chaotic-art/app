<script setup lang="ts">
const props = defineProps<{
  item: ListingCartItem
}>()

const listingCartStore = useListingCartStore()

const fixedPrice = computed({
  get() {
    return String(props.item.listPrice)
  },
  set(value) {
    listingCartStore.updateItem({
      id: props.item.id,
      listPrice: Number(value),
    })
  },
})
</script>

<template>
  <div>
    <CartItemDetails
      :name="item.name"
      :image="item.metadata?.image"
      :collection-name="item.collection?.name"
      :price="item.price"
    />

    <div class="flex justify-between mt-4">
      <div class="flex flex-col">
        <span class="text-gray-500 dark:text-gray-400 text-sm">Floor</span>
        <Money :value="item.collection.floor" inline />
      </div>

      <ListingCartPriceInput v-model="fixedPrice" class="!w-40" />
    </div>
  </div>
</template>
