<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { tokenEntries } from '~/api/nft-pallets'
import { fetchOdaCollection, fetchOdaToken } from '~/services/oda'

const CONTAINER_ID = 'nft-img-container'

const { token, chain } = useRoute().params
const chainPrefix = computed(() => chain?.toString() as Prefix)
const [collectionId, tokenId] = token?.toString().split('-') ?? []

const safeCollectionId = computed(() => collectionId?.toString() ?? '')

const { data: tokenData } = await useLazyAsyncData(token?.toString() ?? '', () => fetchOdaToken(chainPrefix.value, safeCollectionId.value, tokenId?.toString() ?? ''))

const { data: collection } = await useLazyAsyncData(safeCollectionId.value, () => fetchOdaCollection(chainPrefix.value, safeCollectionId.value))

const {
  owner,
  collectionCreator,
  isLoading,
  error,
  mimeType,
  price: formattedPrice,
  usdPrice,
  mediaIcon,
} = useToken({
  tokenId: Number(tokenId),
  collectionId: Number(collectionId),
  chain: chainPrefix.value,
})

const moreFromCollection = ref<Awaited<ReturnType<typeof tokenEntries>>>([])

onMounted(async () => {
  try {
    const entries = await tokenEntries({ prefix: chainPrefix.value, collectionId: Number(collectionId), max: 6 })
    // Filter out the current token from the results
    moreFromCollection.value = entries.filter(entry => entry.keyArgs[1] !== Number(tokenId)).slice(0, 5)
  }
  catch (error) {
    console.error('Failed to fetch more from collection:', error)
  }
})

// Breadcrumb items
const breadcrumbItems = computed(() => [
  {
    label: 'Home',
    to: '/',
    icon: 'i-heroicons-home',
  },
  {
    label: collection.value?.metadata?.name || `Collection ${safeCollectionId.value}`,
    to: `/${chain}/collection/${safeCollectionId.value}`,
    icon: 'i-heroicons-rectangle-stack',
  },
  {
    label: tokenData.value?.metadata?.name || `Token ${tokenId?.toString() || ''}`,
    icon: 'i-heroicons-photo',
  },
])

useSeoMeta({
  title: tokenData.value?.metadata?.name,
  description: tokenData.value?.metadata?.description?.slice(0, 150),
})
</script>

<template>
  <UContainer class="px-4 md:px-6 max-w-7xl">
    <!-- Loading State -->
    <GalleryLoadingState v-if="isLoading" />

    <!-- Error State -->
    <GalleryErrorState v-else-if="error" />

    <!-- Content -->
    <div v-else>
      <!-- Breadcrumb Navigation -->
      <div class="mb-6">
        <UBreadcrumb :items="breadcrumbItems" />
      </div>

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
            :owner="owner || undefined"
            :collection-creator="collectionCreator || undefined"
            :formatted-price="formattedPrice || undefined"
            :usd-price="usdPrice"
          />
        </div>
      </div>
    </div>

    <!-- more from this collection -->
    <div v-if="moreFromCollection.length > 0" class="mt-12 md:mt-16">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            More from this collection
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Discover other NFTs from {{ collection?.metadata?.name || `Collection ${safeCollectionId}` }}
          </p>
        </div>

        <NuxtLink
          :to="`/${chain}/collection/${safeCollectionId}`"
          class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          View all
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Grid Layout -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
</template>
