<script setup lang="ts">
import { getDrops } from '@/services/fxart'
import { useMintedDropsStore } from '@/stores/dropsMinted'
import { isEvm } from '@/utils/network'

const { prefix } = usePrefix()
const mintedDrops = useMintedDropsStore()
const sortedMintedDrops = computed(() => isEvm(prefix.value) ? mintedDrops.getMintedDrops : mintedDrops.sortedMintedDrops)

const { data: drops } = await useAsyncData('drops', () => getDrops({
  active: [true],
  chain: [isProduction ? 'ahp' : prefix.value],
  limit: 200,
}))
</script>

<template>
  <UContainer>
    <h1 class="text-2xl md:text-4xl font-medium font-serif italic mb-6 md:mb-10 text-center md:text-left px-4 md:px-0">
      {{ $t('drop.generativeArtDrops') }}
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 px-4 md:px-0">
      <DropCard v-for="drop in drops" :key="drop.id" :drop="drop" />
    </div>

    <div v-if="sortedMintedDrops.length">
      <hr class="my-14 border-gray-300">

      <h1 class="text-2xl md:text-4xl font-medium font-serif italic mb-6 md:mb-10 text-center md:text-left px-4 md:px-0">
        {{ $t('drop.pastDrops') }}
      </h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xxl:grid-cols-6 gap-3 md:gap-4 px-4 md:px-0">
        <DropCard v-for="drop in sortedMintedDrops" :key="drop.id" :drop="drop" show-minted />
      </div>
    </div>
  </UContainer>
</template>
