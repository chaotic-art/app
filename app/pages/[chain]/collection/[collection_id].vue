<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { CHAINS } from '@kodadot1/static'
import { fetchOdaCollection } from '~/services/oda'

const route = useRoute()
const { chain: chainPrefix, collection_id } = route.params

const chain = computed(() => chainPrefix as Prefix)

const { data: collection, refresh } = await useAsyncData(
  `collection:${chain.value}:${collection_id}`,
  () => fetchOdaCollection(chain.value, collection_id?.toString() ?? ''),
)

// Clear cache functionality using useOda composable
const { isRefreshing, clearCache: clearOdaCache } = useOda()

function clearCache() {
  clearOdaCache(chain.value, collection_id?.toString() ?? '', refresh)
}

definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && chain in CHAINS
  },
})

useSeoMeta({
  title: collection.value?.metadata.name,
  description: collection.value?.metadata.description.slice(0, 150),
})

defineOgImageComponent('Frame', {
  title: collection.value?.metadata.name,
  image: sanitizeIpfsUrl(collection.value?.metadata.image),
  items: collection.value?.supply,
  claimed: collection.value?.claimed,
  network: chain.value,
})
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <!-- Actual Content -->
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <!-- Collection Image -->
        <div class="order-2 lg:order-1">
          <div class="border p-3 md:p-4 rounded-2xl border-gray-100">
            <img
              v-if="collection?.metadata?.image"
              :src="sanitizeIpfsUrl(collection.metadata.image)"
              :alt="collection.metadata.name || 'Collection'"
              class="aspect-square w-full object-cover rounded-xl"
            >
            <div
              v-else
              class="aspect-square w-full bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center"
            >
              <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
            </div>
          </div>
        </div>

        <!-- Collection Details -->
        <div class="order-1 lg:order-2">
          <!-- Badges -->
          <div class="flex gap-2 mb-4 justify-center lg:justify-start">
            <UBadge class="rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white" icon="i-heroicons-star">
              Collection
            </UBadge>
            <UBadge class="rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white" icon="i-token-polkadot">
              {{ chain.toUpperCase() }}
            </UBadge>
          </div>

          <!-- Title -->
          <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold font-serif italic text-center lg:text-left mb-6 lg:mb-8 text-gray-900 dark:text-white">
            {{ collection?.metadata?.name || `Collection #${collection_id}` }}
          </h1>

          <!-- Description -->
          <div v-if="collection?.metadata?.description" class="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6 lg:mb-8">
            <MarkdownPreview :source="collection.metadata.description" />
          </div>

          <!-- Owner Info -->
          <div v-if="collection?.owner" class="flex justify-center lg:justify-start items-center gap-4 mb-8">
            <div class="p-1 bg-gray-100 dark:bg-gray-800 inline-block rounded-full">
              <UserInfo :avatar-size="40" :address="collection.owner" />
            </div>
            <FollowButton
              :target="collection.owner"
              class="px-4 py-2"
            />
          </div>

          <!-- Quick Stats in Header -->
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center lg:text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div class="text-xl md:text-2xl font-bold font-serif italic text-gray-900 dark:text-white">
                {{ collection?.claimed || 0 }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Claimed Items
              </div>
            </div>

            <div class="text-center lg:text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div class="text-xl md:text-2xl font-bold font-serif italic text-gray-900 dark:text-white">
                {{ unlimited(collection?.supply) ? 'Unlimited' : collection?.supply || 0 }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total Supply
              </div>
            </div>

            <div class="text-center lg:text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div class="text-xl md:text-2xl font-bold font-serif italic text-gray-900 dark:text-white">
                {{ collection_id }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Collection ID
              </div>
            </div>
          </div>

          <!-- Clear Cache Section -->
          <div class="mt-8 bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
              <div class="text-center md:text-left">
                <h3 class="text-lg font-bold font-serif italic text-gray-900 dark:text-white mb-2">
                  Refresh Collection Data
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  The images and metadata displayed are cached by Chaotic from official websites and on-chain data.
                  While we strive for accuracy, cached data may become outdated. Use the refresh button below to clear the cache and fetch the latest information.
                </p>
              </div>
              <UButton
                :loading="isRefreshing"
                :disabled="isRefreshing"
                class="rounded-full px-6 py-3"
                variant="outline"
                icon="i-heroicons-arrow-path"
                @click="clearCache"
              >
                {{ isRefreshing ? 'Refreshing...' : 'Clear' }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <USeparator class="my-12 md:my-20" />

      <!-- Items Section -->
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 class="text-2xl md:text-3xl font-bold font-serif italic text-center md:text-left text-gray-900 dark:text-white">
            Collection Items
          </h2>

          <div class="flex gap-2 md:gap-4">
            <UButton class="rounded-full px-3 md:px-4 py-2 text-sm" label="Newest" variant="outline" />
            <UButton class="rounded-full px-3 md:px-4 py-2 text-sm" label="Price" variant="outline" />
            <UButton class="rounded-full px-3 md:px-4 py-2 text-sm" label="Rarity" variant="outline" />
          </div>
        </div>

        <!-- Items Grid -->
        <LazyNftsGrid
          :variables="{ collections: [collection_id], orderBy: 'blockNumber_DESC' }"
          grid-class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6"
          no-items-found-message="This collection doesn't have any items yet."
        />
      </div>
    </div>
  </UContainer>
</template>
