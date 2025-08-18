<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OdaToken, OnchainCollection } from '~/services/oda'
import TokenCard from '~/components/common/card/TokenCard.client.vue'
import TokenActivity from '~/components/gallery/TokenActivity.vue'
import { tokenEntries } from '~/utils/api/substrate.nft-pallets'

interface Props {
  tokenData: OdaToken | null
  collection: OnchainCollection | null
  chain: AssetHubChain
  collectionId: string
  tokenId: string
  mimeType?: string
}

const props = defineProps<Props>()
const moreFromCollection = ref<Awaited<ReturnType<typeof tokenEntries>>>([])

onMounted(async () => {
  try {
    const entries = await tokenEntries({
      prefix: props.chain,
      collectionId: Number(props.collectionId),
      max: 6,
      excludeTokenId: Number(props.tokenId),
    })
    moreFromCollection.value = entries
  }
  catch (error) {
    console.error('Failed to fetch more from collection:', error)
  }
})
</script>

<template>
  <!-- Additional Content -->
  <div class="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 py-12 my-12">
    <UContainer class="space-y-6">
      <!-- Item Activity and Token Details Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        <!-- Item Activity (3/5) -->
        <div class="lg:col-span-3">
          <TokenActivity
            :chain="chain"
            :collection-id="collectionId"
            :token-id="tokenId"
          />
        </div>

        <!-- Token Details (2/5) -->
        <div class="lg:col-span-2">
          <div class="space-y-6">
            <h2 class="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              Token Details
            </h2>

            <div class="space-y-4">
              <!-- Properties Card -->
              <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
                <div class="space-y-3">
                  <!-- Chain -->
                  <div class="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center mr-3">
                        <UIcon name="i-heroicons-link" class="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Chain</span>
                    </div>
                    <span class="text-sm font-semibold text-neutral-900 dark:text-white capitalize bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md">
                      {{ chain }}
                    </span>
                  </div>

                  <!-- Token ID -->
                  <div class="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center mr-3">
                        <UIcon name="i-heroicons-hashtag" class="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Token ID</span>
                    </div>
                    <span class="text-sm font-mono font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md">
                      {{ tokenId }}
                    </span>
                  </div>

                  <!-- Collection -->
                  <div class="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center mr-3">
                        <UIcon name="i-heroicons-rectangle-stack" class="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Collection</span>
                    </div>
                    <span class="text-sm font-mono font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md">
                      {{ collectionId }}
                    </span>
                  </div>

                  <!-- Token Standard -->
                  <div class="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center mr-3">
                        <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Token Standard</span>
                    </div>
                    <span class="text-sm font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md">
                      NFT
                    </span>
                  </div>

                  <!-- Media Type -->
                  <div v-if="mimeType" class="flex items-center justify-between py-3">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center mr-3">
                        <UIcon name="i-heroicons-document" class="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Media Type</span>
                    </div>
                    <span class="text-sm font-mono font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md">
                      {{ mimeType }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- More from this collection -->
      <div v-if="moreFromCollection.length > 0">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              More from this collection
            </h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Discover other NFTs from {{ collection?.metadata?.name || `Collection ${collectionId}` }}
            </p>
          </div>

          <NuxtLink
            :to="`/${chain}/collection/${collectionId}`"
            class="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            View all
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <!-- Grid Layout -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          <TokenCard
            v-for="nft in moreFromCollection"
            :key="nft.keyArgs[1]"
            :token-id="nft.keyArgs[1]"
            :collection-id="nft.keyArgs[0]"
            :chain="chain"
            :image="nft.metadata?.image"
            :name="nft.metadata?.name"
          />
        </div>
      </div>
    </UContainer>
  </div>
</template>
