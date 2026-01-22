<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { fetchOdaToken } from '~/services/oda'

const CONTAINER_ID = 'nft-img-container'

const { token, chain } = useRoute().params
const chainPrefix = computed(() => chain?.toString() as AssetHubChain)
const [collectionId, tokenId] = token?.toString().split('-') ?? []

const safeCollectionId = computed(() => collectionId?.toString() ?? '')
const safeTokenId = computed(() => tokenId?.toString() ?? '')

const {
  owner,
  collectionCreator,
  mimeType,
  nativePrice: price,
  price: formattedPrice,
  usdPrice,
  mediaIcon,
  token: tokenData,
  collection,
  highestOffer,
} = useToken({
  tokenId: Number(tokenId),
  collectionId: Number(collectionId),
  chain: chainPrefix.value,
})

const { data: item } = useLazyAsyncData(
  `token:${chainPrefix.value}:${tokenId}`,
  async () => {
    const item = await fetchOdaToken(chainPrefix.value, safeCollectionId.value, safeTokenId.value)
    return item
  },
  {
    transform: (data) => {
      return {
        ...data,
        metadata: {
          ...data.metadata,
          image: data.metadata?.image ? sanitizeIpfsUrl(data.metadata.image) : undefined,
        },
      }
    },
  },
)

useSeoMeta({
  title: () => item.value?.metadata?.name,
  description: () => item.value?.metadata?.description?.slice(0, 150),
  ogImage: () => sanitizeIpfsUrl(item.value?.metadata?.image || ''), // TODO: at the moment satori somehow doesn't work on cf-pages (defineOgImageComponent)
})

const tokenMetadata = computed(() => {
  if (item.value?.metadata.name) {
    return item.value
  }

  return tokenData.value
})
</script>

<template>
  <div>
    <UContainer class="px-4 md:px-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Media Section -->
        <div class="order-2 lg:order-1">
          <GalleryMediaViewer
            :token-data="tokenMetadata"
            :collection-data="collection"
            :collection-id="safeCollectionId"
            :mime-type="mimeType || undefined"
            :media-icon="mediaIcon"
            :container-id="CONTAINER_ID"
          />
        </div>

        <!-- Details Section -->
        <div class="order-1 lg:order-2">
          <GalleryDetails
            :token-data="tokenMetadata"
            :collection="collection"
            :chain="chainPrefix"
            :collection-id="safeCollectionId"
            :token-id="safeTokenId"
            :owner="owner || undefined"
            :collection-creator="collectionCreator || undefined"
            :formatted-price="formattedPrice || undefined"
            :usd-price="usdPrice"
            :highest-offer="highestOffer"
            :price="BigInt(price ?? '0')"
            :mime-type="mimeType"
          />
          <GalleryItemActions
            class="mt-6"
            :token-data="tokenData"
            :collection="collection"
            :chain="chainPrefix"
            :collection-id="Number(safeCollectionId)"
            :token-id="Number(safeTokenId)"
            :owner="owner"
            :price="BigInt(price ?? '0')"
            :highest-offer="highestOffer"
          />
        </div>
      </div>
    </UContainer>

    <!-- Additional Content -->
    <GalleryAdditionalContent
      :token-data="tokenMetadata"
      :collection="collection"
      :chain="chainPrefix"
      :collection-id="safeCollectionId"
      :token-id="safeTokenId"
      :mime-type="mimeType || undefined"
    />

    <LazyMakeOfferModal />
  </div>
</template>
