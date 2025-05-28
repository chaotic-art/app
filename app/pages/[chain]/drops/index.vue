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
    <h1 class="text-4xl font-bold font-serif italic mb-10">
      Generative Art Drops
    </h1>

    <div class="grid grid-cols-6 gap-4">
      <NuxtLink v-for="drop in drops" :key="drop.id" :to="`/${chain}/drops/${drop.alias}`" class="border rounded-xl border-gray-300 overflow-hidden">
        <img :src="sanitizeIpfsUrl(drop.image)" :alt="drop.name" class="aspect-square">

        <div class="p-4">
          <p class="font-bold text-lg mb-2">
            {{ drop.name }}
          </p>

          <p class="text-sm text-gray-500 bg-gray-100 rounded-full p-0.5">
            <UserInfo :avatar-size="16" :address="drop.creator" />
          </p>
        </div>
      </NuxtLink>
    </div>
  </UContainer>
</template>
