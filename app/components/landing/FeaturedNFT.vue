<script lang="ts" setup>
import type { DropItem } from '~/types'
import { formatBalance } from 'dedot/utils'
import { tokenToUsd } from '@/utils/calculation'
import { ipfsToCfImageUrl } from '@/utils/ipfs'

const props = defineProps<{
  drop?: DropItem
}>()

// Format price for display
const formattedPrice = computed(() => {
  if (!props.drop?.price)
    return 'Free'

  return formatBalance(props.drop.price, {
    decimals: chainSpec[props.drop.chain].tokenDecimals,
    symbol: chainSpec[props.drop.chain].tokenSymbol,
  })
})

// Format USD equivalent using the utility function
const formattedPriceUSD = computed(() => {
  if (!props.drop?.price)
    return 'Free'

  return tokenToUsd(Number(props.drop.price), chainSpec[props.drop.chain].tokenDecimals, chainSpec[props.drop.chain].tokenSymbol)
})

// Loading state
const isLoading = computed(() => !props.drop)

// Badge text based on drop status
const badgeText = computed(() => {
  if (!props.drop)
    return ''

  const status = props.drop.status
  const isMintedOut = props.drop.isMintedOut

  if (status === 'minting_live')
    return 'Live Now'
  if (status === 'minting_ended' || isMintedOut)
    return 'Minted Out'
  return 'Coming Soon'
})

// Function to share the drop
function shareDrop() {
  if (!props.drop)
    return

  const url = `${window.location.origin}/${props.drop.chain}/drops/${props.drop.alias}`
  if (navigator.share) {
    navigator.share({
      title: props.drop.name || 'Untitled Collection',
      text: props.drop.collectionDescription || 'Check out this amazing collection!',
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
        <div v-if="isLoading" class="bg-background rounded-xl shadow-xl overflow-hidden border border-border">
          <div class="grid lg:grid-cols-2 gap-0">
            <div class="relative aspect-square bg-muted animate-pulse" />
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
        <div v-else-if="drop" class="bg-background rounded-xl shadow-xl overflow-hidden border border-border group">
          <div class="grid lg:grid-cols-2 gap-0">
            <!-- Image Section -->
            <div class="relative aspect-square">
              <img
                :src="ipfsToCfImageUrl(drop.image || drop.banner, 'detail')"
                :alt="drop.name"
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
                  {{ drop.name || 'Untitled Collection' }}
                </h3>
                <div class="flex items-center space-x-3 mb-4">
                  <div>
                    <UserInfo
                      :address="drop.creator || drop.collection"
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
                  {{ drop.collectionDescription || 'No description available for this collection.' }}
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
                    {{ drop.max || 'Unknown' }}
                  </p>
                  <p class="text-sm text-neutral-500 dark:text-neutral-500">
                    Total Items
                  </p>
                </div>
              </div>

              <!-- Minting Progress -->
              <div class="mb-6">
                <div class="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Minted: {{ drop.minted || 0 }}</span>
                  <span>{{ drop.max ? Math.round((drop.minted / drop.max) * 100) : 0 }}%</span>
                </div>
                <UProgress :model-value="drop.minted" :max="drop.max" />
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-3">
                <!-- Primary Button - Mint Now or View Details -->
                <UButton
                  v-if="!drop.isMintedOut"
                  class="flex-1 text-lg"
                  size="lg"
                  block
                  :to="`/${drop.chain}/drops/${drop.alias}`"
                >
                  {{ drop.status === 'minting_live' ? 'Mint Now' : 'View Details' }}
                </UButton>

                <!-- Secondary Button - Always show View Collection -->
                <UButton
                  variant="outline"
                  class="flex-1 text-lg"
                  size="lg"
                  block
                  :to="`/${drop.chain}/collection/${drop.collection}`"
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
