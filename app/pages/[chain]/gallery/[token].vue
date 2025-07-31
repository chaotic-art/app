<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { fetchOdaCollection, fetchOdaToken } from '~/services/oda'

const CONTAINER_ID = 'nft-img-container'

const { token, chain } = useRoute().params
const [collectionId, tokenId] = token?.toString().split('-') ?? []

const { data: tokenData } = await useLazyAsyncData(
  () => fetchOdaToken(chain as Prefix, collectionId?.toString() ?? '', tokenId?.toString() ?? ''),
)

const { data: collection } = await useLazyAsyncData(
  () => fetchOdaCollection(chain as Prefix, collectionId?.toString() ?? ''),
)

const {
  owner,
  isLoading,
  error,
  mimeType,
  price: formattedPrice,
  usdPrice,
  mediaIcon,
} = useToken({
  tokenId: Number(tokenId),
  collectionId: Number(collectionId),
  chain: chain as Prefix,
})

useSeoMeta({
  title: tokenData.value?.metadata.name,
  description: tokenData.value?.metadata.description.slice(0, 150),
})
</script>

<template>
  <UContainer class="px-4 md:px-6 py-4 md:py-6">
    <!-- Loading State -->
    <GalleryLoadingState v-if="isLoading" />

    <!-- Error State -->
    <GalleryErrorState v-else-if="error" />

    <!-- Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
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
          :chain="chain as string"
          :collection-id="collectionId ?? ''"
          :owner="owner || undefined"
          :formatted-price="formattedPrice || undefined"
          :usd-price="usdPrice"
        />
      </div>
    </div>
  </UContainer>
</template>
