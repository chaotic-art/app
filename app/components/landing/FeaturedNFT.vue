<script lang="ts" setup>
import { formatBalance } from 'dedot/utils'
import { getEnrichedDrop } from '@/components/drop/utils'
import { getDrops } from '@/services/fxart'
import { calculateTokenUSD } from '@/utils/coinPrice'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

const { prefix } = usePrefix()

// Fetch the most recent active drop to feature
const { data: featuredDrop } = await useLazyAsyncData(() => getDrops({
  active: [true],
  chain: [isProduction ? 'ahp' : prefix.value],
  limit: 1,
}), {
  transform: async (data) => {
    if (data.length > 0) {
      return await getEnrichedDrop(data[0]!)
    }
    return null
  },
})

// Format price for display
const formattedPrice = computed(() => {
  if (!featuredDrop.value?.price)
    return 'Free'

  return formatBalance(featuredDrop.value.price, {
    decimals: decimalsOf(featuredDrop.value.chain),
    symbol: tokenSymbolOf(featuredDrop.value.chain),
  })
})

// Format USD equivalent using the utility function
const formattedPriceUSD = computed(() => {
  if (!featuredDrop.value?.price)
    return 'Free'

  return calculateTokenUSD(featuredDrop.value.price, featuredDrop.value.chain)
})

// Loading state
const isLoading = computed(() => !featuredDrop.value)

// Badge text based on drop status
const badgeText = computed(() => {
  if (!featuredDrop.value)
    return ''

  const status = featuredDrop.value.status
  const isMintedOut = featuredDrop.value.isMintedOut

  if (status === 'minting_live')
    return 'Live Now'
  if (status === 'minting_ended' || isMintedOut)
    return 'Minted Out'
  return 'Coming Soon'
})
</script>

<template>
  <section class="py-16 lg:py-24">
    <UContainer>
      <div class="text-center mb-12">
        <UBadge variant="soft" class="mb-6">
          Featured Collection
        </UBadge>
        <h2 class="text-3xl lg:text-4xl xl:text-5xl text-neutral-900 dark:text-white mb-6 leading-tight font-serif">
          Trending This <span class="text-neutral-500 italic">Week</span>
        </h2>
        <p class="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
          Discover the most sought-after digital art pieces from our curated collection
        </p>
      </div>

      <div class="max-w-6xl mx-auto">
        <!-- Loading State -->
        <div v-if="isLoading" class="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
          <div class="grid lg:grid-cols-2 gap-0">
            <div class="relative aspect-square lg:aspect-auto bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div class="p-8 lg:p-12 flex flex-col justify-center">
              <div class="space-y-4">
                <div class="h-8 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-3/4" />
                <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        </div>

        <!-- Featured Drop Content -->
        <div v-else-if="featuredDrop" class="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
          <div class="grid lg:grid-cols-2 gap-0">
            <!-- Image Section -->
            <div class="relative aspect-square">
              <img
                :src="sanitizeIpfsUrl(featuredDrop.image || featuredDrop.banner)"
                :alt="featuredDrop.name"
                class="w-full h-full object-contain"
              >
              <div class="absolute top-4 left-4">
                <UBadge class="bg-black/80 text-white">
                  {{ badgeText }}
                </UBadge>
              </div>
              <div class="absolute top-4 right-4 flex space-x-2">
                <UButton size="sm" variant="soft" class="bg-white/90 backdrop-blur dark:bg-neutral-700/90">
                  <UIcon name="i-heroicons-heart" class="h-4 w-4" />
                </UButton>
                <UButton size="sm" variant="soft" class="bg-white/90 backdrop-blur dark:bg-neutral-700/90">
                  <UIcon name="i-heroicons-share" class="h-4 w-4" />
                </UButton>
              </div>
            </div>

            <!-- Content Section -->
            <div class="p-8 lg:p-12 flex flex-col justify-between">
              <div class="mb-6">
                <h3 class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                  {{ featuredDrop.name || 'Untitled Collection' }}
                </h3>
                <div class="flex items-center space-x-3 mb-4">
                  <div>
                    <UserInfo
                      :address="featuredDrop.creator || featuredDrop.collection"
                      :avatar-size="42"
                      :transparent-background="true"
                      :custom-name="true"
                    >
                      <template #name="{ addressName }">
                        <div>
                          Artist:
                          <p class="font-semibold text-neutral-900 dark:text-white">
                            {{ addressName || 'Unknown Collection' }}
                          </p>
                        </div>
                      </template>
                    </UserInfo>
                  </div>
                </div>
                <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 line-clamp-3">
                  {{ featuredDrop.collectionDescription || 'No description available for this collection.' }}
                </p>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                  <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                    Price
                  </p>
                  <p class="text-2xl font-bold text-neutral-900 dark:text-white">
                    {{ formattedPrice }}
                  </p>
                  <p class="text-sm text-neutral-500 dark:text-neutral-500">
                    {{ formattedPriceUSD }}
                  </p>
                </div>
                <div class="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                  <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                    Supply
                  </p>
                  <p class="text-2xl font-bold text-neutral-900 dark:text-white">
                    {{ featuredDrop.max || 'Unknown' }}
                  </p>
                  <p class="text-sm text-neutral-500 dark:text-neutral-500">
                    Total Items
                  </p>
                </div>
              </div>

              <!-- Minting Progress -->
              <div class="mb-6">
                <div class="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  <span>Minted: {{ featuredDrop.minted || 0 }}</span>
                  <span>{{ featuredDrop.max ? Math.round((featuredDrop.minted / featuredDrop.max) * 100) : 0 }}%</span>
                </div>
                <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    class="bg-neutral-900 dark:bg-white h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${featuredDrop.max ? (featuredDrop.minted / featuredDrop.max) * 100 : 0}%` }"
                  />
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-3">
                <!-- Primary Button - Mint Now or View Details -->
                <UButton
                  v-if="!featuredDrop.isMintedOut"
                  color="neutral"
                  variant="solid"
                  class="flex-1 text-lg"
                  size="lg"
                  block
                  :to="`/${featuredDrop.chain}/drops/${featuredDrop.alias}`"
                >
                  {{ featuredDrop.status === 'minting_live' ? 'Mint Now' : 'View Details' }}
                </UButton>

                <!-- Secondary Button - Always show View Collection -->
                <UButton
                  color="neutral"
                  variant="outline"
                  class="flex-1 text-lg"
                  size="lg"
                  block
                  :to="`/${featuredDrop.chain}/collection/${featuredDrop.collection}`"
                >
                  View Collection
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- No Featured Drop State -->
        <div v-else class="text-center py-12">
          <p class="text-neutral-600 dark:text-neutral-400">
            No featured drops available at the moment.
          </p>
        </div>
      </div>
    </UContainer>
  </section>
</template>
