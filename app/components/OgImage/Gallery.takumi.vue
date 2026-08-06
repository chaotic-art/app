<script setup lang="ts">
import type { CSSProperties } from 'vue'
// import { KODA_LOGO_URL } from '@/utils/constants'

// inherited attrs can interfere with the OG image renderer
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  title: string
  image?: string
  usd?: string | number
  price?: string | number
  symbol?: string
  network: string
}>()

const cover: CSSProperties = {
  objectFit: 'cover',
  objectPosition: 'center',
}

const parseUsd = computed(() => {
  const usd = Number.parseFloat(String(props.usd ?? ''))
  return usd ? `$${usd}` : '--'
})

const parsePrice = computed(() => {
  const price = Number.parseFloat(String(props.price ?? ''))
  return price ? `${price} ${props.symbol}` : '--'
})

// Takumi preserves indentation around static text nodes, so keep labels interpolated.
const labels = {
  network: 'network',
  priceUsd: 'price (usd)',
  price: 'price',
} as const
</script>

<template>
  <img v-if="image" :src="image" :alt="title" :style="cover" class="h-full w-full">

  <div
    class="flex flex-col justify-end h-full w-full bg-slate-900/85 text-white p-20 text-2xl font-bold absolute inset-0"
  >
    <img v-if="image" :src="image" :alt="title" class="w-30 h-30 object-cover rounded-md border border-white">
    <h1 class="mt-10 mb-8 text-5xl leading-none font-bold">
      {{ title }}
    </h1>
    <div class="flex flex-row">
      <div class="flex flex-col">
        <div class="text-2xl font-bold m-0">
          {{ network }}
        </div>
        <div class="text-gray-400 m-0">
          {{ labels.network }}
        </div>
      </div>

      <div v-if="usd" class="flex flex-col ml-20">
        <div class="text-2xl font-bold m-0">
          {{ parseUsd }}
        </div>
        <div class="text-gray-400 m-0">
          {{ labels.priceUsd }}
        </div>
      </div>

      <div v-if="price" class="flex flex-col ml-20">
        <div class="text-2xl font-bold m-0">
          {{ parsePrice }}
        </div>
        <div class="text-gray-400 m-0">
          {{ labels.price }}
        </div>
      </div>
    </div>
  </div>

  <!-- <img
    :src="KODA_LOGO_URL" alt="logo"
    class="absolute top-20 right-20 w-40"
  > -->
</template>
