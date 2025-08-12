<script setup lang="ts">
import type { ListingCartItem } from '~/stores/listingCart'

const props = defineProps<{
  item: ListingCartItem
}>()

const floorPrice = computed(() => Number(props.item.collection.floor) || 0)
</script>

<template>
  <div class="bg-white dark:bg-neutral-900">
    <div class="flex items-center gap-4 mb-5">
      <!-- NFT Image -->
      <div class="w-12 h-12 bg-gray-200 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden flex-shrink-0">
        <img
          v-if="item.metadata?.image"
          :src="sanitizeIpfsUrl(item.metadata.image)"
          :alt="item.metadata?.name || 'NFT'"
          class="w-full h-full object-cover"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        >
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-neutral-700"
        >
          <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <!-- NFT Details -->
      <div class="flex flex-1 justify-between items-end">
        <div class="flex-1 min-w-0">
          <h2 class="font-bold text-gray-900 dark:text-white truncate">
            {{ item.name || '--' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 truncate">
            {{ item.collection?.name || 'Wanderwave' }}
          </p>
        </div>

        <Money :value="item.price" inline />
      </div>
    </div>

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

      <ListingCartPriceInput v-model="item.listPrice" />
    </div>
  </div>
</template>
