<script lang="ts" setup>
import DropCard from '@/components/drop/DropCard.vue'
import { getEnrichedDrop } from '@/components/drop/utils'
import { getDrops } from '@/services/fxart'

const { prefix } = usePrefix()

// Fetch latest drops
const { data: latestDrops } = await useLazyAsyncData(() => getDrops({
  active: [true],
  chain: [isProduction ? 'ahp' : prefix.value],
  limit: 10,
}), {
  transform: async (data) => {
    return await Promise.all(data.map(getEnrichedDrop))
  },
})

// Loading state
const isLoading = computed(() => !latestDrops.value || latestDrops.value.length === 0)

// Filter out undefined drops and skip the first one (already shown in FeaturedNFT)
const filteredDrops = computed(() => latestDrops.value?.filter((drop): drop is NonNullable<typeof drop> => Boolean(drop)).slice(1, 9) || [])
</script>

<template>
  <section class="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-900">
    <UContainer>
      <div class="text-center mb-12">
        <h2 class="text-3xl lg:text-4xl xl:text-5xl text-neutral-900 dark:text-white mb-6 leading-tight font-serif">
          Latest <span class="text-neutral-500 italic">Generative Art</span>
        </h2>
        <p class="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
          Discover the most recent generative art collections from talented artists worldwide
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden">
          <div class="relative aspect-square bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div class="p-6 space-y-4">
            <div class="h-6 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-3/4" />
            <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>

      <!-- Drops Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ClientOnly>
          <DropCard
            v-for="drop in filteredDrops"
            :key="drop.id"
            :drop="drop"
            :show-minted="true"
          />
        </ClientOnly>
      </div>

      <div class="text-center mt-12">
        <UButton
          variant="outline"
          color="neutral"
          :to="`/${prefix}/drops`"
          class="px-8 py-2 rounded-full"
        >
          View All Drops
        </UButton>
      </div>
    </UContainer>
  </section>
</template>
