<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { SupportedChain } from '~/plugins/sdk.client'

// inherited attrs can interfere with the OG image renderer
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  title: string
  image: string
  items: number
  claimed: number
  network: string
}>()

const cover: CSSProperties = {
  objectFit: 'cover',
  objectPosition: 'center',
}

const networkName = chainSpec[props.network as SupportedChain].name

// Takumi preserves indentation around static text nodes, so keep labels interpolated.
const labels = {
  items: 'items',
  claimed: 'claimed',
  network: 'network',
} as const
</script>

<template>
  <img :src="image" :alt="title" :style="cover" class="h-full w-full">

  <div
    class="flex flex-col justify-end h-full w-full bg-slate-900/85 text-white p-20 text-2xl font-bold absolute inset-0"
  >
    <img
      :src="image"
      :alt="title"
      class="w-70 h-70 object-cover rounded-md border border-white"
    >
    <h1 class="mt-10 mb-2 text-5xl leading-none font-bold">
      {{ title }}
    </h1>
    <div class="flex flex-row">
      <div class="flex flex-col">
        <div class="text-2xl font-bold m-0">
          {{ items }}
        </div>
        <div class="text-gray-400 m-0">
          {{ labels.items }}
        </div>
      </div>

      <div class="flex flex-col ml-16">
        <div class="text-2xl font-bold m-0">
          {{ claimed }}
        </div>
        <div class="text-gray-400 m-0">
          {{ labels.claimed }}
        </div>
      </div>

      <div class="flex flex-col ml-16">
        <div class="text-2xl font-bold m-0">
          {{ networkName }}
        </div>
        <div class="text-gray-400 m-0">
          {{ labels.network }}
        </div>
      </div>
    </div>
  </div>
</template>
