<script setup lang="ts">
defineProps<{
  items: ListingCartItem[]
}>()

const listingCartStore = useListingCartStore()

const fixedPrice = ref('')

function setFixedPrice() {
  listingCartStore.setFixedPrice(Number(fixedPrice.value) || 0)
  fixedPrice.value = ''
}
</script>

<template>
  <div>
    <p>Set All To</p>

    <div class="pt-4 flex flex-col gap-2">
      <ListingCartFloorPrice show-collection-floor-price />

      <div class="pt-3 text-gray-500 dark:text-gray-400">
        -Or-
      </div>
      <div class="pt-3">
        {{ $t('listingCart.fixedPrice') }}
      </div>

      <div class="flex gap-2">
        <ListingCartPriceInput v-model="fixedPrice" class="!w-40" />
        <UButton
          icon="i-heroicons-check"
          variant="outline"
          color="primary"
          @click="setFixedPrice"
        />
      </div>

      <div class="flex flex-col mt-5">
        <div v-for="item in items" :key="item.id">
          <USeparator />
          <ListingCartItem class="py-5" :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>
