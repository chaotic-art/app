<script setup lang="ts">
const swapStore = useAtomicSwapStore()
const { swap } = storeToRefs(swapStore)
const { currentChain } = useChain()
const surcharge = computed(() => swap.value?.surcharge)
const desiredNfts = computed(() => swap.value?.desired)
</script>

<template>
  <div
    class="flex flex-col gap-4 my-10!"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <TokenBasicCard
        v-for="nft in desiredNfts"
        :key="`${currentChain}-${nft.collectionId}-${nft.id}-${nft.meta.image}`"
        :chain="currentChain"
        :image="nft.meta.image"
        :name="nft.name"
      />

      <SwapSurchargeCard
        v-if="surcharge && surcharge.direction === 'Receive'"
        :surcharge="surcharge"
      />
    </div>
  </div>
</template>
