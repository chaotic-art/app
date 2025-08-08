<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import type { OdaToken, OnchainCollection } from '~/services/oda'
import { shortenAddress } from '@/utils/format/address'

interface Props {
  tokenData?: OdaToken
  collection?: OnchainCollection
  chain: Prefix
  collectionId: string | null
  owner?: string
  collectionCreator?: string
  formattedPrice?: string
  usdPrice?: string
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-6">
    <div>
      <!-- Collection Information -->
      <div v-if="collection" class="flex items-center gap-2">
        <NuxtLink
          :to="`/${chain}/collection/${collectionId || ''}`"
          class="font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
        >
          <UIcon name="i-heroicons-rectangle-stack" class="w-4 h-4" />
          {{ collection.metadata?.name || `Collection ${collectionId || ''}` }}
        </NuxtLink>
      </div>

      <!-- Title -->
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
        {{ tokenData?.metadata?.name || 'Untitled NFT' }}
      </h1>
    </div>

    <!-- Description -->
    <div v-if="tokenData?.metadata?.description" class="space-y-2 line-clamp-6">
      <MarkdownPreview :source="tokenData.metadata.description" />
    </div>

    <!-- Creator and Owner Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Creator Card -->
      <div class="p-6 bg-gray-100 rounded-md space-y-2">
        <p class="font-bold">
          Collection Creator
        </p>
        <UserInfo :size="40" :address="collectionCreator || undefined" transparent-background custom-name>
          <template #name="{ addressName }">
            <div>
              <p class="font-bold">
                {{ addressName }}
              </p>
              <p>Collection Creator</p>
            </div>
          </template>
        </UserInfo>
      </div>

      <!-- Owner Card -->
      <div class="p-6 bg-gray-100 rounded-md space-y-2">
        <p class="font-bold">
          Owner
        </p>
        <UserInfo :size="40" :address="owner || undefined" transparent-background custom-name>
          <template #name="{ addressName }">
            <div>
              <p class="font-bold">
                {{ addressName }}
              </p>
              <p>Collector</p>
            </div>
          </template>
        </UserInfo>
      </div>
    </div>

    <div class="space-y-3 bg-gray-100 rounded-md p-6">
      <!-- Current Price Section -->
      <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
        Current Price
      </p>
      <div class="flex items-baseline gap-2">
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ formattedPrice || 'Not for sale' }}
        </p>
        <p v-if="formattedPrice && usdPrice" class="text-sm text-gray-500 dark:text-gray-400">
          ({{ usdPrice }})
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3">
        <UButton
          v-if="formattedPrice"
          class="flex-1 rounded-md"
          color="primary"
          size="lg"
        >
          <template #leading>
            <UIcon name="i-heroicons-bolt" class="w-5 h-5" />
          </template>
          Buy Now
        </UButton>
        <UButton
          class="flex-1 rounded-md"
          variant="outline"
          size="lg"
        >
          <template #leading>
            <UIcon name="i-heroicons-chat-bubble-heart" class="w-5 h-5" />
          </template>
          Make Offer
        </UButton>
      </div>
    </div>
  </div>
</template>
