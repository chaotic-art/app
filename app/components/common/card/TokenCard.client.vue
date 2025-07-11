<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { formatBalance } from '@polkadot/util'
import { fetchOdaToken } from '~/services/oda'

const props = defineProps<{
  tokenId: number
  collectionId: number
  chain: Prefix
  image?: string | null
  name?: string | null
}>()

// Reactive data
const token = ref<Awaited<ReturnType<typeof fetchOdaToken>> | null>(null)
const queryPrice = ref<bigint | null>(null)
const isLoading = ref(true)
const error = ref<unknown | null>(null)

const { $api } = useNuxtApp()

// Fetch data on component mount
onMounted(async () => {
  try {
    // Fetch token metadata and price in parallel
    const [tokenData, priceData] = await Promise.all([
      fetchOdaToken(props.chain, props.collectionId.toString(), props.tokenId.toString()),
      $api(props.chain).query.Nfts.ItemPriceOf.getValue(props.collectionId, props.tokenId).catch(() => null),
    ])

    token.value = tokenData
    queryPrice.value = priceData?.[0] || null
  }
  catch (err) {
    console.error('Failed to fetch token data:', err)
    error.value = err
  }
  finally {
    isLoading.value = false
  }
})

const price = computed(() => {
  if (!queryPrice.value)
    return ''

  const pricesString = formatBalance(queryPrice.value, { decimals: 10, withSi: false })
  let float = Number.parseFloat(pricesString)
  float = float > 1 ? Number(float.toFixed(0)) : Number(float.toFixed(4))

  return `${float} DOT`
})
</script>

<template>
  <div class="border rounded-xl border-gray-300 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-900 hover-card-effect">
    <!-- Loading State -->
    <template v-if="isLoading">
      <!-- Image Skeleton -->
      <div class="aspect-square bg-gray-200 dark:bg-neutral-800 animate-pulse flex items-center justify-center">
        <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
      </div>

      <!-- Content Skeleton -->
      <div class="p-4 space-y-3">
        <!-- Title Skeleton -->
        <div class="h-4 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse w-3/4" />

        <!-- Price Skeleton -->
        <div class="flex items-center justify-between">
          <div class="h-3 bg-gray-100 dark:bg-neutral-700 rounded animate-pulse w-1/3" />
        </div>
      </div>
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <div class="aspect-square bg-red-50 dark:bg-red-900 flex items-center justify-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-400 dark:text-red-300" />
      </div>
      <div class="p-4">
        <p class="text-red-600 dark:text-red-300 text-sm">
          Failed to load NFT
        </p>
      </div>
    </template>

    <!-- Loaded State -->
    <template v-else>
      <NuxtLink :to="`/${chain}/gallery/${collectionId}-${tokenId}`" class="block hover:shadow-lg transition-shadow">
        <!-- NFT Image -->
        <div class="aspect-square bg-gray-200 dark:bg-neutral-800 overflow-hidden">
          <img
            v-if="image || token?.metadata?.image"
            :src="sanitizeIpfsUrl(image || token?.metadata?.image)"
            :alt="token?.metadata?.name || 'NFT'"
            class="w-full h-full object-cover"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          >
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-neutral-700"
          >
            <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-4">
          <p class="font-bold mb-2 text-gray-900 dark:text-white truncate">
            {{ name || token?.metadata?.name || 'Untitled NFT' }}
          </p>

          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
              {{ price || 'No price set' }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </template>
  </div>
</template>
