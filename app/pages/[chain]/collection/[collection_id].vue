<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { CHAINS } from '@kodadot1/static'
import { useSortOptions } from '~/composables/useSortOptions'
import { fetchOdaCollection } from '~/services/oda'
import { copyAddress, getSubscanUrl, shortenAddress } from '~/utils/format/address'

const route = useRoute()
const { chain: chainPrefix, collection_id } = route.params

const chain = computed(() => chainPrefix as Prefix)

const { data: collection, refresh } = await useLazyAsyncData(
  `collection:${chain.value}:${collection_id}`,
  () => fetchOdaCollection(chain.value, collection_id?.toString() ?? ''),
)

// Clear cache functionality using useOda composable
const { isRefreshing, clearCache: clearOdaCache } = useOda()

function clearCache() {
  clearOdaCache(chain.value, collection_id?.toString() ?? '', refresh)
}

const { selectedSort, createQueryVariables } = useSortOptions()

const queryVariables = computed(() =>
  createQueryVariables([collection_id?.toString() ?? '']),
)

// Floor price data
const { $sdk } = useNuxtApp()
const floorPrice = ref(0)
const owner = ref('')
const isLoadingFloor = ref(false)

// Fetch floor price data
onMounted(async () => {
  if (!collection_id)
    return

  isLoadingFloor.value = true
  try {
    const api = $sdk(chain.value).api
    const [queryFloor, queryCollection] = await Promise.all([
      api.query.Nfts.ItemPriceOf.getEntries(Number(collection_id)),
      api.query.Nfts.Collection.getValue(Number(collection_id)),
    ])

    owner.value = queryCollection?.owner.toString() ?? ''

    if (queryFloor.length) {
      const floorValues = queryFloor
        .filter(item => Number(item.value[0]) > 0)
        .map(item => Number(item.value[0]))

      if (floorValues.length) {
        floorPrice.value = Math.min(...floorValues)
      }
    }
  }
  catch (error) {
    console.error('Error fetching floor price:', error)
  }
  finally {
    isLoadingFloor.value = false
  }
})

definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && chain in CHAINS
  },
})

useSeoMeta({
  title: collection.value?.metadata?.name,
  description: collection.value?.metadata?.description?.slice(0, 150),
})

defineOgImageComponent('Frame', {
  title: collection.value?.metadata?.name,
  image: sanitizeIpfsUrl(collection.value?.metadata?.image),
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
          <div v-if="owner" class="flex items-center gap-4 p-4 bg-secondary rounded-2xl border border-gray-200 dark:border-gray-700">
            <div class="shrink-0">
              <UserInfo :address="owner" />
            </div>
            <div class="flex-1 min-w-0 hidden md:block">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                Collection Owner
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ shortenAddress(owner) }}
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <UButton
                size="sm"
                variant="outline"
                icon="i-heroicons-clipboard-document"
                @click="() => copyAddress(owner)"
              >
                Copy
              </UButton>
              <UButton
                :to="getSubscanUrl(owner, chain)"
                target="_blank"
                size="sm"
                variant="outline"
                icon="i-heroicons-arrow-top-right-on-square"
              >
                Subscan
              </UButton>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-secondary rounded-2xl border border-gray-200 dark:border-gray-700">
              <div class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {{ collection?.claimed || 0 }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Claimed
              </div>
            </div>

            <div class="text-center p-4 bg-secondary rounded-2xl border border-gray-200 dark:border-gray-700">
              <div class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {{ unlimited(collection?.supply) ? '∞' : collection?.supply || 0 }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Supply
              </div>
            </div>

            <div class="text-center p-4 bg-secondary rounded-2xl border border-gray-200 dark:border-gray-700">
              <div class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                <UIcon v-if="isLoadingFloor" name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin mx-auto" />
                <Money v-else-if="floorPrice" inline :value="floorPrice" />
                <span v-else class="text-gray-400 dark:text-gray-500">–</span>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Floor Price
              </div>
            </div>
          </div>

          <!-- Clear Cache Section -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
            <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div class="flex-1">
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

        <div class="w-full md:w-auto">
          <SortOptions
            v-model="selectedSort"
            class="w-full md:w-48"
          />
        </div>
      </div>

      <!-- Items Grid -->
      <LazyNftsGrid
        :key="selectedSort"
        :variables="queryVariables"
        grid-class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6"
        no-items-found-message="This collection doesn't have any items yet."
      />
    </div>
  </UContainer>
</template>
