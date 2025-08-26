<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'

const CONTAINER_ID = 'nft-img-container'

const { token, chain } = useRoute().params
const chainPrefix = computed(() => chain?.toString() as AssetHubChain)
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

useSeoMeta({
  title: () => tokenData.value?.metadata?.name,
  description: () => tokenData.value?.metadata?.description?.slice(0, 150),
})

defineOgImageComponent('Gallery', {
  title: tokenData.value?.metadata?.name,
  image: sanitizeIpfsUrl(tokenData.value?.metadata?.image),
  usd: usdPrice.value,
  price: formattedPrice.value,
  symbol: chainSpec[chainPrefix.value].tokenSymbol,
  network: chainSpec[chainPrefix.value].name,
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
              :collection-data="collection"
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
    <GalleryAdditionalContent
      :token-data="tokenData"
      :collection="collection"
      :chain="chainPrefix"
      :collection-id="safeCollectionId"
      :token-id="safeTokenId"
      :mime-type="mimeType || undefined"
    />
  </div>
</template>
