<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import type { OdaToken, OnchainCollection } from '~/services/oda'

interface Props {
  tokenData?: OdaToken
  collection?: OnchainCollection
  chain: Prefix
  collectionId: string
  owner?: string
  formattedPrice?: string
  usdPrice?: string
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-4 md:space-y-6">
    <div>
      <!-- Title -->
      <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white text-center lg:text-left leading-tight">
        {{ tokenData?.metadata?.name || 'Untitled NFT' }}
      </h1>

      <!-- Collection Link -->
      <div v-if="collection" class="text-center lg:text-left">
        <NuxtLink
          :to="`/${chain}/collection/${collectionId}`"
          class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors font-medium"
        >
          <UIcon name="i-heroicons-rectangle-stack" class="w-4 h-4" />
          {{ collection.metadata?.name || `Collection ${collectionId}` }}
        </NuxtLink>
      </div>
    </div>

    <!-- Owner Section -->
    <GalleryOwnerInfo :owner="owner" />

    <!-- Description -->
    <div v-if="tokenData?.metadata?.description" class="space-y-2">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Description
      </h3>
      <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
        {{ tokenData.metadata.description }}
      </p>
    </div>

    <!-- Price Section -->
    <GalleryPriceSection :formatted-price="formattedPrice" :usd-price="usdPrice" />

    <!-- Token Information -->
    <GalleryTokenInfo :token-data="tokenData" :chain="chain" />
  </div>
</template>
