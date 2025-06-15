<script setup lang="ts">
import type { CollectionEntityWithVolumes } from './utils/types'

defineProps<{
  collection?: CollectionEntityWithVolumes
}>()
</script>

<template>
  <div class="rounded-[15px] w-full h-[350px] md:h-[490px] flex flex-col relative overflow-hidden shadow-sm">
    <div class="w-full aspect-square bg-white flex items-center justify-center">
      <img
        v-if="collection?.image"
        :src="collection.image"
        :alt="collection.name"
        class="w-full h-full object-cover"
      >
      <div v-else class="w-full h-full bg-neutral-300" />
    </div>
    <div class="bg-white px-4 py-6 flex items-center min-h-16">
      <span class="text-xl text-black truncate">
        {{ collection?.name || '—' }}
      </span>
    </div>
  </div>
</template>
