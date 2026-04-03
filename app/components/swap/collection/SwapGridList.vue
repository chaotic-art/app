<script setup lang="ts">
import type { AssetHubChain } from '~/types/chain'

const swapStore = useAtomicSwapStore()
const { swap } = storeToRefs(swapStore)
const { currentChain } = useChain()
const chain = computed(() => currentChain.value as AssetHubChain)
const surcharge = computed(() => swap.value?.surcharge)
const desiredNfts = computed(() => swap.value?.desired)

// TODO: get from desiredNft
const { collection } = useOdaCollection(computed(() => Number(desiredNfts.value[0]?.collectionId)))
</script>

<template>
  <div
    class="flex flex-col gap-4 my-10!"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <TokenBasicCard
        v-for="nft in desiredNfts"
        :key="`${currentChain}-${nft.collectionId}-${nft.id}-${nft.meta.image}`"
        :chain="chain"
        :image="nft.meta.image"
        :name="nft.name"
        :owner="collection?.owner"
      />

      <SwapSurchargeCard
        v-if="surcharge && surcharge.direction === 'Receive'"
        :surcharge="surcharge"
      />
    </div>
  </div>
</template>
