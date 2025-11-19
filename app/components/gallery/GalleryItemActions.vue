<script setup lang="ts">
import type { HighestNftOffer } from '../trade/types'
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OdaToken, OnchainCollection } from '~/services/oda'

interface Props {
  tokenData: OdaToken | null
  collection: OnchainCollection | null
  chain: AssetHubChain
  collectionId: number
  tokenId: number
  owner: string | null
  price: bigint | null
  highestOffer: HighestNftOffer | null
}

const props = defineProps<Props>()

const {
  addToShoppingCart,
  buyNow,
  listNow,
  isItemInShoppingCart,
  canBuy,
  canOffer,
  canList,
  createOffer,
  createSwap,
} = useCartActions({
  tokenId: props.tokenId,
  collectionId: props.collectionId,
  chain: props.chain,
  token: computed(() => props.tokenData),
  collection: computed(() => props.collection),
  owner: computed(() => props.owner),
  price: computed(() => props.price),
  highestOffer: computed(() => props.highestOffer),
})
</script>

<template>
  <div>
    <GalleryItemTradeActions
      v-if="canOffer && !canBuy"
      @create-offer="createOffer"
      @create-swap="createSwap"
    />

    <div v-if="canBuy" class="grid md:grid-cols-2 gap-4">
      <GalleryItemTradeActions
        variant="secondary"
        @create-offer="createOffer"
        @create-swap="createSwap"
      />

      <div class="flex-1 flex gap-3">
        <UButton
          color="primary"
          size="lg"
          class="flex-1"
          @click="buyNow"
        >
          Buy Now
        </UButton>
        <UButton
          size="lg"
          :icon="isItemInShoppingCart ? 'ic:outline-remove-shopping-cart' : 'ic:outline-shopping-cart'"
          class="size-10"
          @click="addToShoppingCart"
        />
      </div>
    </div>

    <div v-else-if="canList" class="flex gap-4">
      <UButton
        color="primary"
        size="lg"
        class="flex-1"
        @click="listNow"
      >
        {{ !price ? 'List' : 'Change Price' }}
      </UButton>
    </div>
  </div>
</template>
