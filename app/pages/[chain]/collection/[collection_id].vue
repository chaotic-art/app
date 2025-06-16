<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { CHAINS } from '@kodadot1/static'
import { fetchOdaCollection } from '~/services/oda'

const route = useRoute()
const { chain: chainPrefix, collection_id } = route.params
const { $api } = useNuxtApp()

const chain = computed(() => chainPrefix as Prefix)
const loading = ref(true)

const { data: collection } = await useLazyAsyncData(
  `collection:${chain.value}:${collection_id}`,
  () => fetchOdaCollection(chain.value, collection_id?.toString() ?? ''),
)

const collectionData = ref<any>(null)
const items = ref<number[]>([])

definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && chain in CHAINS
  },
})

onMounted(async () => {
  try {
    const api = $api(chain.value)
    const [queryCollection, queryItems] = await Promise.all([
      api.query.Nfts.Collection.getValue(Number(collection_id)),
      api.query.Nfts.Item.getEntries(Number(collection_id)),
    ])

    collectionData.value = queryCollection
    items.value = queryItems.map(item => item.keyArgs[1]).sort((a, b) => b - a)
  }
  catch (error) {
    console.error('Error fetching collection data:', error)
  }
  finally {
    loading.value = false
  }
})

const collectionStats = computed(() => {
  if (!collectionData.value || !items.value.length)
    return null

  return {
    totalItems: items.value.length,
    owner: collectionData.value.owner?.toString() || '',
  }
})
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-8">
      <!-- Header skeleton - two column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <!-- Image skeleton -->
        <div class="order-2 lg:order-1">
          <div class="border p-3 md:p-4 rounded-2xl border-gray-100">
            <USkeleton class="aspect-square w-full rounded-xl" />
          </div>
        </div>

        <!-- Details skeleton -->
        <div class="order-1 lg:order-2">
          <!-- Badges skeleton -->
          <div class="flex gap-2 mb-4 justify-center lg:justify-start">
            <USkeleton class="h-6 w-16 rounded-full" />
            <USkeleton class="h-6 w-20 rounded-full" />
          </div>

          <!-- Title skeleton -->
          <USkeleton class="h-12 md:h-16 lg:h-20 w-full mb-6 lg:mb-8" />

          <!-- Description skeleton -->
          <div class="space-y-2 mb-6 lg:mb-8">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-4 w-1/2" />
          </div>

          <!-- Owner info skeleton -->
          <div class="flex justify-center lg:justify-start items-center gap-4 mb-8">
            <USkeleton class="w-12 h-12 rounded-full" />
            <USkeleton class="h-10 w-24 rounded-full" />
          </div>

          <!-- Quick stats skeleton -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-gray-50 rounded-xl">
              <USkeleton class="h-6 w-full mb-2" />
              <USkeleton class="h-3 w-16" />
            </div>
            <div class="p-3 bg-gray-50 rounded-xl">
              <USkeleton class="h-6 w-full mb-2" />
              <USkeleton class="h-3 w-20" />
            </div>
          </div>
        </div>
      </div>

      <!-- Full stats skeleton -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div v-for="i in 4" :key="i" class="text-center">
          <USkeleton class="h-8 w-full mb-2" />
          <USkeleton class="h-4 w-24 mx-auto" />
        </div>
      </div>

      <!-- Items grid skeleton -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        <div v-for="i in 10" :key="i">
          <USkeleton class="aspect-square w-full mb-3 rounded-xl" />
          <USkeleton class="h-4 w-full mb-2" />
          <USkeleton class="h-4 w-3/4" />
        </div>
      </div>
    </div>

    <!-- Actual Content -->
    <div v-else class="space-y-8">
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
              class="aspect-square w-full bg-gray-200 rounded-xl flex items-center justify-center"
            >
              <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
            </div>
          </div>
        </div>

        <!-- Collection Details -->
        <div class="order-1 lg:order-2">
          <!-- Badges -->
          <div class="flex gap-2 mb-4 justify-center lg:justify-start">
            <UBadge class="rounded-full bg-gray-100 text-black" icon="i-heroicons-star">
              Collection
            </UBadge>
            <UBadge class="rounded-full bg-gray-100 text-black" icon="i-token-polkadot">
              {{ chain.toUpperCase() }}
            </UBadge>
          </div>

          <!-- Title -->
          <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold font-serif italic text-center lg:text-left mb-6 lg:mb-8">
            {{ collection?.metadata?.name || `Collection #${collection_id}` }}
          </h1>

          <!-- Description -->
          <div v-if="collection?.metadata?.description" class="text-sm md:text-base text-gray-600 mb-6 lg:mb-8">
            <MarkdownPreview :source="collection.metadata.description" />
          </div>

          <!-- Owner Info -->
          <div v-if="collectionStats?.owner" class="flex justify-center lg:justify-start items-center gap-4 mb-8">
            <div class="p-1 bg-gray-100 inline-block rounded-full">
              <UserInfo :avatar-size="40" :address="collectionStats.owner" />
            </div>
            <FollowButton
              :target="collectionStats.owner"
              class="px-4 py-2"
            />
          </div>

          <!-- Quick Stats in Header -->
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center lg:text-left p-3 bg-gray-50 rounded-xl">
              <div class="text-xl md:text-2xl font-bold font-serif italic text-gray-900">
                {{ collectionStats?.totalItems || 0 }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Total Items
              </div>
            </div>

            <div class="text-center lg:text-left p-3 bg-gray-50 rounded-xl">
              <div class="text-xl md:text-2xl font-bold font-serif italic text-gray-900">
                {{ collection_id }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Collection ID
              </div>
            </div>
          </div>
        </div>
      </div>

      <USeparator class="my-12 md:my-20" />

      <!-- Items Section -->
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 class="text-2xl md:text-3xl font-bold font-serif italic text-center md:text-left">
            Collection Items
          </h2>

          <div class="flex gap-2 md:gap-4">
            <UButton class="rounded-full px-3 md:px-4 py-2 text-sm" label="Newest" variant="outline" />
            <UButton class="rounded-full px-3 md:px-4 py-2 text-sm" label="Price" variant="outline" />
            <UButton class="rounded-full px-3 md:px-4 py-2 text-sm" label="Rarity" variant="outline" />
          </div>
        </div>

        <!-- Items Grid -->
        <div v-if="items.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          <LazyTokenCard
            v-for="tokenId in items"
            :key="tokenId"
            :token-id="tokenId"
            :collection-id="Number(collection_id)"
            :chain="chain"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <div class="text-gray-400 mb-4">
            <UIcon name="i-heroicons-photo" class="w-16 h-16 mx-auto" />
          </div>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">
            No items found
          </h3>
          <p class="text-gray-500">
            This collection doesn't have any items yet.
          </p>
        </div>
      </div>
    </div>
  </UContainer>
</template>
