<script setup lang="ts">
import type { ItemMedia } from './SuccessfulItemsMedia.vue'

const props = defineProps<{
  items: ItemMedia[]
  header?: string
  showPrice?: boolean
}>()

const COLLAPSED_ITEMS_COUNT = 5

const expanded = ref(false)

const moreItems = computed(() => props.items.length - COLLAPSED_ITEMS_COUNT)
const showMore = computed(() => props.items.length > COLLAPSED_ITEMS_COUNT)
const displayItems = computed(() =>
  props.items.slice(
    0,
    showMore.value && !expanded.value ? COLLAPSED_ITEMS_COUNT : undefined,
  ),
)
</script>

<template>
  <div
    class="flex flex-col items-center gap-3"
    :class="{
      'max-h-[260px] overflow-hidden': !expanded,
      'max-h-[390px] overflow-y-auto': expanded,
    }"
  >
    <div
      v-for="item in displayItems"
      :key="item.id"
      class="flex flex-row items-center gap-4"
    >
      <img
        class="border border-gray-200 dark:border-gray-700 aspect-square size-10! rounded shrink-0"
        :src="sanitizeIpfsUrl(item.image)"
      >

      <div class="flex justify-between w-full">
        <p>{{ item.name }}</p>
        <Money
          v-if="showPrice"
          :value="item.price"
          inline
        />
      </div>
    </div>
  </div>

  <div
    v-if="showMore"
    class="flex mt-4 items-center"
    :class="[expanded ? 'justify-end' : 'justify-between']"
  >
    <div
      v-if="!expanded"
      class="flex items-center gap-3"
    >
      <div
        class="bg-k-grey-light px-1 py-1 text-center rounded-full text-gray-500 text-xs w-8"
      >
        +{{ moreItems }}
      </div>
      <span class="text-gray-500 text-xs">Items</span>
    </div>

    <a
      class="text-xs text-gray-500"
      @click="expanded = !expanded"
    >{{
      expanded ? 'Show Less' : 'Show All'
    }}</a>
  </div>

  <div
    v-if="header"
    class="mt-5 border-b-k-shade"
  >
    <p class="is-size-6 capitalize font-bold text-center">
      {{ header }}
    </p>
  </div>
</template>
