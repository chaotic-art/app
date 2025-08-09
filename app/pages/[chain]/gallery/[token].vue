<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { tokenEntries } from '~/api/nft-pallets'

const CONTAINER_ID = 'nft-img-container'

const { token, chain } = useRoute().params
const chainPrefix = computed(() => chain?.toString() as Prefix)
const [collectionId, tokenId] = token?.toString().split('-') ?? []

const safeCollectionId = computed(() => collectionId?.toString() ?? '')
const safeTokenId = computed(() => tokenId?.toString() ?? '')

const {
  owner,
  collectionCreator,
  isLoading,
  error,
  mimeType,
  price: formattedPrice,
  usdPrice,
  mediaIcon,
  token: tokenData,
  collection,
} = useToken({
  tokenId: Number(tokenId),
  collectionId: Number(collectionId),
  chain: chainPrefix.value,
})

const moreFromCollection = ref<Awaited<ReturnType<typeof tokenEntries>>>([])

onMounted(async () => {
  try {
    const entries = await tokenEntries({
      prefix: chainPrefix.value,
      collectionId: Number(collectionId),
      max: 6,
      excludeTokenId: Number(tokenId),
    })
    moreFromCollection.value = entries
  }
  catch (error) {
    console.error('Failed to fetch more from collection:', error)
  }
})

useSeoMeta({
  title: () => tokenData.value?.metadata?.name,
  description: () => tokenData.value?.metadata?.description?.slice(0, 150),
})
</script>

<template>
  <div>
    <UContainer class="px-4 md:px-6">
      <!-- Loading State -->
      <GalleryLoadingState v-if="isLoading" />

      <!-- Error State -->
      <GalleryErrorState v-else-if="error" />

      <!-- Content -->
      <div v-else>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <!-- Media Section -->
          <div class="order-2 lg:order-1">
            <GalleryMediaViewer
              :token-data="tokenData"
              :mime-type="mimeType || undefined"
              :media-icon="mediaIcon"
              :container-id="CONTAINER_ID"
            />
          </div>

          <!-- Details Section -->
          <div class="order-1 lg:order-2">
            <GalleryDetails
              :token-data="tokenData"
              :collection="collection"
              :chain="chainPrefix"
              :collection-id="safeCollectionId"
              :token-id="safeTokenId"
              :owner="owner || undefined"
              :collection-creator="collectionCreator || undefined"
              :formatted-price="formattedPrice || undefined"
              :usd-price="usdPrice"
            />
          </div>
        </div>
      </div>
    </UContainer>

    <!-- Additional Content -->
    <div class="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 py-12 my-12">
      <UContainer class="space-y-6">
        <!-- Item Activity and Token Details Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <!-- Item Activity (3/5) -->
          <div class="lg:col-span-3">
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h2 class="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
                  Item Activity
                </h2>
                <UButton variant="ghost" color="neutral" size="sm" class="text-neutral-500 dark:text-neutral-400">
                  <UIcon name="i-heroicons-funnel" class="w-4 h-4 mr-2" />
                  Filter
                </UButton>
              </div>

              <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <!-- Activity Header -->
                <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                  <div class="grid grid-cols-4 gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <span>Event</span>
                    <span>Price</span>
                    <span>From</span>
                    <span>Date</span>
                  </div>
                </div>

                <!-- Activity Content -->
                <div class="p-6">
                  <div class="text-center py-12">
                    <div class="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UIcon name="i-heroicons-clock" class="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 class="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                      No activity yet
                    </h3>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                      When someone buys, sells, or transfers this item, it will show up here.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Token Details (2/5) -->
          <div class="lg:col-span-2">
            <div class="space-y-6">
              <h2 class="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
                Token Details
              </h2>

              <div class="space-y-4">
                <!-- Properties Card -->
                <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
                  <div class="space-y-3">
                    <!-- Chain -->
                    <div class="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center mr-3">
                          <UIcon name="i-heroicons-link" class="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Chain</span>
                      </div>
                      <span class="text-sm font-semibold text-neutral-900 dark:text-white capitalize bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md">
                        {{ chainPrefix }}
                      </span>
                    </div>

                    <!-- Token ID -->
                    <div class="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center mr-3">
                          <UIcon name="i-heroicons-hashtag" class="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Token ID</span>
                      </div>
                      <span class="text-sm font-mono font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md">
                        {{ safeTokenId }}
                      </span>
                    </div>

                    <!-- Collection -->
                    <div class="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center mr-3">
                          <UIcon name="i-heroicons-rectangle-stack" class="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Collection</span>
                      </div>
                      <span class="text-sm font-mono font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md">
                        {{ safeCollectionId }}
                      </span>
                    </div>

                    <!-- Token Standard -->
                    <div class="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center mr-3">
                          <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Token Standard</span>
                      </div>
                      <span class="text-sm font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md">
                        NFT
                      </span>
                    </div>

                    <!-- Media Type -->
                    <div v-if="mimeType" class="flex items-center justify-between py-3">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center mr-3">
                          <UIcon name="i-heroicons-document" class="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Media Type</span>
                      </div>
                      <span class="text-sm font-mono font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md">
                        {{ mimeType }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- more from this collection -->
        <div v-if="moreFromCollection.length > 0">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h2 class="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
                More from this collection
              </h2>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Discover other NFTs from {{ collection?.metadata?.name || `Collection ${safeCollectionId}` }}
              </p>
            </div>

            <NuxtLink
              :to="`/${chain}/collection/${safeCollectionId}`"
              class="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              View all
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
            </NuxtLink>
          </div>

          <!-- Grid Layout -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            <TokenCard
              v-for="nft in moreFromCollection"
              :key="nft.keyArgs[1]"
              :token-id="nft.keyArgs[1]"
              :collection-id="nft.keyArgs[0]"
              :chain="chainPrefix"
              :image="nft.metadata?.image"
              :name="nft.metadata?.name"
            />
          </div>
        </div>
      </UContainer>
    </div>
  </div>
</template>
