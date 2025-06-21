<script setup lang="ts">
import type { proccessData } from './utils/useTopCollections'

const props = defineProps<{
  collection?: Awaited<ReturnType<typeof proccessData>>[number]
}>()

const { prefix } = usePrefix()

const { volume } = useCollectionVolume(
  props.collection,
  ref('All'),
)
</script>

<template>
  <NuxtLink :to="`${collection?.id && `/${prefix}/collection/${collection.id}`}`" class="rounded-[15px] w-full flex flex-col relative overflow-hidden shadow-sm">
    <div class="w-full aspect-square bg-white flex items-center justify-center">
      <img
        v-if="collection?.image"
        :src="collection.image"
        :alt="collection.name || ''"
        class="w-full h-full object-cover"
      >
      <div v-else class="w-full h-full bg-neutral-300" />
    </div>
    <div class="bg-white px-4 py-6 flex flex-col min-h-16">
      <span class="text-xl text-black truncate text-center font-bold">
        {{ collection?.name || '—' }}
      </span>
      <div class="flex justify-around mt-4 gap-1">
        <div class="flex flex-col items-center">
          <div class="text-sm text-neutral-400 font-medium">
            {{ $t('common.price') }}
          </div>
          <div class="text-xl text-black font-normal">
            <Money :value="collection?.floor" :inline="true" :round="2" />
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div class="text-sm text-neutral-400 font-medium">
            {{ $t('collection.volume') }}
          </div>
          <div class="text-xl text-black font-normal">
            <Money :value="volume" :inline="true" :round="0" />
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
