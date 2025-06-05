<script setup lang="ts">
import { getDrops } from '~/services/fxart'

const route = useRoute()
const chain = computed(() => route.params.chain)

const { data: drops } = await useAsyncData('drops', () => getDrops({
  active: [true],
  chain: ['ahp'],
  limit: 100,
}))
</script>

<template>
  <UContainer>
    <h1 class="text-2xl md:text-4xl font-bold font-serif italic mb-6 md:mb-10 text-center md:text-left px-4 md:px-0">
      Generative Art Drops
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 px-4 md:px-0">
      <NuxtLink v-for="drop in drops" :key="drop.id" :to="`/${chain}/drops/${drop.alias}`" class="border rounded-xl border-gray-300 overflow-hidden hover:shadow-lg transition-shadow">
        <img :src="sanitizeIpfsUrl(drop.image)" :alt="drop.name" class="aspect-square w-full object-cover">

        <div class="p-3 md:p-4">
          <p class="font-bold text-base md:text-lg mb-1 md:mb-2 line-clamp-2">
            {{ drop.name }}
          </p>

          <div class="text-sm text-gray-500 rounded-full p-0.5">
            <UserInfo :avatar-size="16" :address="drop.creator" :transparent-background="true" />
          </div>
        </div>
      </NuxtLink>
    </div>
  </UContainer>
</template>
