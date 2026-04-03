<script setup lang="ts">
import { t } from 'try'
import { fetchOdaToken } from '~/services/oda'
import { parseAssetHubTokenId } from '~/utils/nft'

const CONTAINER_ID = 'nft-img-container'

const route = useRoute()
const { currentChain, assetHubChain, canInteract: canInteractOnChain } = useChain()
const { token } = route.params

const [collectionId, tokenId] = token?.toString().split('-') ?? []

const safeCollectionId = computed(() => collectionId?.toString() ?? '')
const safeTokenId = computed(() => tokenId?.toString() ?? '')
const parsedTokenId = computed(() => parseAssetHubTokenId(safeCollectionId.value, safeTokenId.value))

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
  rarity,
} = useToken({
  tokenId: safeTokenId.value,
  collectionId: safeCollectionId.value,
  chain: currentChain.value,
  fetchRarity: true,
})

const [ok, err, odaTokenDataResult] = await t(fetchOdaToken(currentChain.value, safeCollectionId.value, safeTokenId.value))
const odaTokenData = ok ? odaTokenDataResult : { metadata: null, price: null, owner: null }
if (!ok) {
  const errMessage = err instanceof Error ? err.message : String(err)
  console.error('Error fetching ODA token', errMessage)
}
const item = {
  ...odaTokenData,
  metadata: {
    ...odaTokenData.metadata,
    image: sanitizeIpfsUrl(odaTokenData.metadata?.image),
  },
}

useSeoMeta({
  title: () => item.metadata?.name,
  description: () => item.metadata?.description?.slice(0, 150),
})

defineOgImage({
  component: 'Gallery',
  props: {
    title: item.metadata?.name,
    image: item.metadata?.image,
    network: chainConfig[currentChain.value].name,
    symbol: chainConfig[currentChain.value].tokenSymbol,
  },
})

const tokenMetadata = computed(() => {
  if (item.metadata.name) {
    return item
  }

  return tokenData.value
})

definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isChain(chain) && isOdaChain(chain)
  },
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
            :chain="currentChain"
            :collection-id="safeCollectionId"
            :token-id="safeTokenId"
            :owner="owner || undefined"
            :collection-creator="collectionCreator || undefined"
            :formatted-price="formattedPrice || undefined"
            :usd-price="usdPrice"
            :highest-offer="highestOffer"
            :rarity="rarity"
            :price="BigInt(price ?? '0')"
            :mime-type="mimeType"
            :can-interact="canInteractOnChain"
          />
          <GalleryItemActions
            v-if="canInteractOnChain && assetHubChain && parsedTokenId"
            class="mt-6"
            :token-data="tokenData"
            :collection="collection"
            :chain="assetHubChain"
            :collection-id="parsedTokenId.collectionId"
            :token-id="parsedTokenId.tokenId"
            :owner="owner"
            :price="BigInt(price ?? '0')"
            :highest-offer="highestOffer"
          />
        </div>
      </div>
    </UContainer>

    <!-- Additional Content -->
    <GalleryAdditionalContent
      v-if="assetHubChain"
      :token-data="tokenMetadata"
      :collection="collection"
      :chain="currentChain"
      :collection-id="safeCollectionId"
      :token-id="safeTokenId"
      :mime-type="mimeType || undefined"
      :can-interact="canInteractOnChain"
    />

    <LazyMakeOfferModal v-if="canInteractOnChain" />
  </div>
</template>
