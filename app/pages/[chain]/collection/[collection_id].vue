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
    <!-- Hero Section -->
    <div class="py-8 md:py-12">
      <div class="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-12">
        <!-- Collection Image -->
        <div class="lg:col-span-3">
          <div class="relative group">
            <div class="aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <img
                v-if="collection?.metadata?.image"
                :src="sanitizeIpfsUrl(collection.metadata.image)"
                :alt="collection.metadata.name || 'Collection'"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              >
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <UIcon name="i-heroicons-photo" class="w-20 h-20 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <!-- Collection Details -->
        <div class="lg:col-span-3 space-y-6">
          <!-- Badges -->
          <div class="flex gap-2 flex-wrap">
            <UBadge
              class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
              variant="soft"
            >
              Collection
            </UBadge>
            <UBadge
              class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
              variant="soft"
            >
              {{ chain.toUpperCase() }}
            </UBadge>
          </div>

          <!-- Title -->
          <div>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              {{ collection?.metadata?.name || `Collection #${collection_id}` }}
            </h1>
          </div>

          <!-- Description -->
          <div v-if="collection?.metadata?.description" class="prose prose-gray dark:prose-invert max-w-none">
            <MarkdownPreview :source="collection.metadata.description" />
          </div>

          <!-- Owner Info -->
          <div v-if="collection?.owner" class="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div class="shrink-0">
              <UserInfo :avatar-size="48" :address="collection.owner" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                Collection Owner
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ collection.owner }}
              </p>
            </div>
            <FollowButton
              :target="collection.owner"
              class="shrink-0"
              size="sm"
            />
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {{ collection?.claimed || 0 }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Claimed
              </div>
            </div>

            <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {{ unlimited(collection?.supply) ? '∞' : collection?.supply || 0 }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Supply
              </div>
            </div>

            <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                #{{ collection_id }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ID
              </div>
            </div>
          </div>

          <!-- Clear Cache Section -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
            <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Data Refresh
                  </h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Collection data is cached for better performance. If you notice outdated information,
                  use the refresh button to fetch the latest data from the blockchain.
                </p>
              </div>
              <UButton
                :loading="isRefreshing"
                :disabled="isRefreshing"
                class="shrink-0"
                variant="outline"
                @click="clearCache"
              >
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
                {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
              </UButton>
            </div>
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
  </UContainer>
</template>
