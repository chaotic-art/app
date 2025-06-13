<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { formatBalance } from '@polkadot/util'
import { fetchOdaToken } from '~/services/oda'

const props = defineProps<{
  tokenId: number
  collectionId: number
  chain: Prefix
}>()

const { data: token } = await useAsyncData(`token:${props.chain}:${props.collectionId}:${props.tokenId}`, () => fetchOdaToken(props.chain, props.collectionId.toString(), props.tokenId.toString()))

// fetch price
const { $api } = useNuxtApp()
const queryPrice = await $api(props.chain).query.Nfts.ItemPriceOf.getValue(props.collectionId, props.tokenId)

const price = computed(() => {
  if (!queryPrice)
    return ''

  const pricesString = formatBalance(queryPrice?.[0], { decimals: 10, withSi: false })
  let float = Number.parseFloat(pricesString)
  float = float > 1 ? Number(float.toFixed(0)) : Number(float.toFixed(4))

  return `${float} DOT`
})
</script>

<template>
  <NuxtLink :to="`/${chain}/gallery/${collectionId}-${tokenId}`" class="border rounded-xl border-gray-300 overflow-hidden">
    <img :src="token?.metadata.image" alt="NFT" class="aspect-square">

    <div class="p-4">
      <p class="font-bold mb-2">
        {{ token?.metadata.name }}
      </p>

      <div class="flex items-center justify-between">
        <p>{{ price }}</p>
        <!-- <UBadge label="1 minute" variant="soft" class="bg-gray-100 rounded-full" /> -->
      </div>
    </div>
  </NuxtLink>
</template>
