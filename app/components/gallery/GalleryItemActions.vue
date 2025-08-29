<script setup lang="ts">
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
}

const props = defineProps<Props>()

const {
  addToShoppingCart,
  buyNow,
  listNow,
  isItemInShoppingCart,
  canBuy,
  canList,
} = useCartActions({
  tokenId: props.tokenId,
  collectionId: props.collectionId,
  chain: props.chain,
  token: computed(() => props.tokenData),
  collection: computed(() => props.collection),
  owner: computed(() => props.owner),
  price: computed(() => props.price),
})
</script>

<template>
  <div>
    <div v-if="canBuy" class="flex gap-3">
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
