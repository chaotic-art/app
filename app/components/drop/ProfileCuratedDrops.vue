<script lang="ts" setup>
import DropCard from '@/components/drop/DropCard.vue'

const props = defineProps<{
  id: string
}>()

const { prefix } = usePrefix()

const { data: drops, pending } = await useFetch('/api/genart/list', {
  query: {
    chain: [prefix.value],
    creator: props.id,
  },
})
</script>

<template>
  <div
    v-if="drops?.data?.length"
    class="py-6 px-4"
  >
    <div class="flex flex-col gap-6 w-full">
      <div
        v-if="!pending"
        class="flex flex-wrap items-center max-md:gap-2 justify-between"
      >
        <div class="flex gap-2 items-center">
          <p class="text-xl font-bold">
            Curated Generative Drops
          </p>

          <UIcon
            name="i-heroicons-check-badge"
            class="w-5 h-5 text-primary"
          />
        </div>

        <UTooltip
          text="Discover generative art collections owned by this artist. Each curated drop is created using algorithms, resulting in unique and dynamic artworks that blend creativity with computational precision."
          :popper="{ placement: 'top' }"
        >
          <p class="text-muted text-sm capitalize cursor-help hover:text-neutral-8 transition-colors">
            How this works?
          </p>
        </UTooltip>
      </div>

      <div
        v-else
        class="flex justify-between items-center"
      >
        <div class="flex gap-2 items-center">
          <USkeleton class="w-64 h-6 rounded" />
          <USkeleton class="w-5 h-5 rounded-full" />
        </div>
        <USkeleton class="w-32 h-4 rounded" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        <ClientOnly>
          <DropCard v-for="drop in drops.data" :key="drop.alias" :drop="drop" show-minted />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>
