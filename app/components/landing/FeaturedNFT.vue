<script lang="ts" setup>
import { formatBalance } from 'dedot/utils'
import { getEnrichedDrop } from '@/components/drop/utils'
import { getDrops } from '@/services/fxart'
import { calculateTokenUSD } from '@/utils/coinPrice'
import { ipfsToCfImageUrl } from '@/utils/ipfs'

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

// Function to share the drop
function shareDrop() {
  if (!featuredDrop.value)
    return

  const url = `${window.location.origin}/${featuredDrop.value.chain}/drops/${featuredDrop.value.alias}`
  if (navigator.share) {
    navigator.share({
      title: featuredDrop.value.name || 'Untitled Collection',
      text: featuredDrop.value.collectionDescription || 'Check out this amazing collection!',
      url,
    }).catch((error) => {
      console.error('Error sharing drop:', error)
    })
  }
  else {
    // Fallback for browsers that do not support Web Share API
    navigator.clipboard.writeText(url).catch((err) => {
      console.error('Error copying drop URL:', err)
    })
  }
}
</script>

<template>
  <section class="py-16 lg:py-24">
    <UContainer>
      <div class="text-center mb-12">
        <div class="inline-flex items-center space-x-2 bg-background backdrop-blur rounded-full px-4 py-2 mb-6 border border-border mx-auto">
          <UIcon name="i-heroicons-star" class="h-4 w-4 text-foreground" />
          <span class="text-sm font-medium text-foreground">Featured Collection</span>
        </div>
        <h2 class="text-3xl lg:text-4xl xl:text-5xl text-foreground mb-6 leading-tight font-serif">
          Trending <span class="text-muted-foreground italic">This Week</span>
        </h2>
        <p class="text-lg text-primary max-w-3xl mx-auto leading-relaxed">
          Discover the most sought-after digital art pieces from our curated collection
        </p>
      </div>

      <div class="max-w-6xl mx-auto">
        <!-- Loading State -->
        <div v-if="isLoading" class="bg-background rounded-3xl shadow-2xl overflow-hidden border border-border">
          <div class="grid lg:grid-cols-2 gap-0">
            <div class="relative aspect-square lg:aspect-auto bg-muted animate-pulse" />
            <div class="p-8 lg:p-12 flex flex-col justify-center">
              <div class="space-y-4">
                <div class="h-8 bg-muted rounded animate-pulse" />
                <div class="h-4 bg-muted rounded animate-pulse" />
                <div class="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div class="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        </div>

        <!-- Featured Drop Content -->
        <div v-else-if="featuredDrop" class="bg-background rounded-xl shadow-xl overflow-hidden border border-border group">
          <div class="grid lg:grid-cols-2 gap-0">
            <!-- Image Section -->
            <div class="relative aspect-square">
              <img
                :src="ipfsToCfImageUrl(featuredDrop.image || featuredDrop.banner, 'detail')"
                :alt="featuredDrop.name"
                class="w-full h-full object-contain"
              >
              <div class="absolute top-4 left-4">
                <UBadge class="bg-background text-foreground">
                  {{ badgeText }}
                </UBadge>
              </div>
              <div class="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <UButton
                  size="sm"
                  color="info"
                  class="backdrop-blur size-8"
                  icon="i-heroicons-share"
                  @click="shareDrop"
                />
              </div>
            </div>

            <!-- Content Section -->
            <div class="p-8 lg:p-12 flex flex-col justify-between">
              <div class="mb-6">
                <h3 class="text-3xl lg:text-4xl font-bold text-foreground mb-2">
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
                          <p class="font-semibold text-foreground">
                            {{ addressName || 'Unknown Collection' }}
                          </p>
                        </div>
                      </template>
                    </UserInfo>
                  </div>
                </div>
                <p class="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                  {{ featuredDrop.collectionDescription || 'No description available for this collection.' }}
                </p>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-muted rounded-lg p-4">
                  <p class="text-sm text-muted-foreground mb-1">
                    Price
                  </p>
                  <p class="text-2xl font-bold text-foreground">
                    {{ formattedPrice }}
                  </p>
                  <p class="text-sm text-neutral-500 dark:text-neutral-500">
                    {{ formattedPriceUSD }}
                  </p>
                </div>
                <div class="bg-muted rounded-lg p-4">
                  <p class="text-sm text-muted-foreground mb-1">
                    Supply
                  </p>
                  <p class="text-2xl font-bold text-foreground">
                    {{ featuredDrop.max || 'Unknown' }}
                  </p>
                  <p class="text-sm text-neutral-500 dark:text-neutral-500">
                    Total Items
                  </p>
                </div>
              </div>

              <!-- Minting Progress -->
              <div class="mb-6">
                <div class="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Minted: {{ featuredDrop.minted || 0 }}</span>
                  <span>{{ featuredDrop.max ? Math.round((featuredDrop.minted / featuredDrop.max) * 100) : 0 }}%</span>
                </div>
                <UProgress v-model="featuredDrop.minted" :max="featuredDrop.max" />
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-3">
                <!-- Primary Button - Mint Now or View Details -->
                <UButton
                  v-if="!featuredDrop.isMintedOut"
                  class="flex-1 text-lg"
                  size="lg"
                  block
                  :to="`/${featuredDrop.chain}/drops/${featuredDrop.alias}`"
                >
                  {{ featuredDrop.status === 'minting_live' ? 'Mint Now' : 'View Details' }}
                </UButton>

                <!-- Secondary Button - Always show View Collection -->
                <UButton
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
          <p class="text-muted-foreground">
            No featured drops available at the moment.
          </p>
        </div>
      </div>
    </UContainer>
  </section>
</template>
