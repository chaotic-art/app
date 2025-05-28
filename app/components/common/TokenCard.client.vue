<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { fetchOdaToken } from '~/services/oda'

const props = defineProps<{
  tokenId: number
  collectionId: number
  chain: Prefix
}>()

const { data: token } = await useAsyncData(`token:${props.chain}:${props.collectionId}:${props.tokenId}`, () => fetchOdaToken(props.chain, props.collectionId.toString(), props.tokenId.toString()))
</script>

<template>
  <div class="border rounded-xl border-gray-300 overflow-hidden">
    <img :src="token?.metadata.image" alt="NFT" class="aspect-square">

    <div class="p-4">
      <p class="font-bold mb-2">
        {{ token?.metadata.name }}
      </p>

      <div class="flex items-center justify-between">
        <p>20 DOT</p>
        <UBadge label="1 minute" variant="soft" class="bg-gray-100 rounded-full" />
      </div>
    </div>
  </div>
</template>
