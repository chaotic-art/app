<script setup lang="ts">
import type { dropStats } from './utils'
import type { DropItem } from '~/types'

interface Collector {
  address: string
  items: number
}

interface Props {
  drop?: DropItem
  collectionStats?: Awaited<ReturnType<typeof dropStats>>
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  drop: undefined,
  collectionStats: undefined,
  isLoading: false,
})

// Derive collectors data from collectionStats
const allCollectors = computed<Collector[]>(() => {
  if (!props.collectionStats?.ownershipMap)
    return []

  return Array.from(props.collectionStats.ownershipMap.values())
    .sort((a, b) => b.items - a.items)
})

const topCollectors = computed<Collector[]>(() => {
  return allCollectors.value
    .slice(0, 3) // Show top 3 collectors regardless of NFT count
})

const earlyCollectors = computed<Collector[]>(() => {
  if (!props.collectionStats?.ownerTokenIds)
    return []

  // Get the first 10 unique owners based on lowest token IDs
  const earlyOwners = new Map<string, { address: string, items: number, minTokenId: number }>()

  // Create a copy to avoid mutating the original array
  const sortedTokenIds = [...props.collectionStats.ownerTokenIds]
    .sort((a, b) => a.tokenId - b.tokenId)

  sortedTokenIds.forEach(({ owner, tokenId }) => {
    if (!earlyOwners.has(owner)) {
      const ownerData = props.collectionStats?.ownershipMap.get(owner)
      if (ownerData) {
        earlyOwners.set(owner, {
          address: owner,
          items: ownerData.items,
          minTokenId: tokenId,
        })
      }
    }
  })

  return Array.from(earlyOwners.values())
    .slice(0, 3)
    .map(({ address, items }) => ({ address, items }))
})

// Helper functions for collector status
function isTopCollector(collector: Collector): boolean {
  return topCollectors.value.some(top => top.address === collector.address)
}

function isEarlyCollector(collector: Collector): boolean {
  return earlyCollectors.value.some(early => early.address === collector.address)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Collectors Header -->
    <div class="text-center">
      <h2 class="text-2xl md:text-3xl font-medium font-serif italic mb-4">
        Collectors Information
      </h2>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        Discover who's collecting this generative art collection and explore collector statistics.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="props.isLoading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-muted-foreground border-t-transparent mb-4" />
      <p class="text-muted-foreground">
        Loading collector data...
      </p>
    </div>

    <!-- Top Section: Whales, Early Adopters, Collection Stats -->
    <div v-if="!props.isLoading && props.collectionStats" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Whales Section -->
      <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-crown" class="text-muted-foreground size-5" />
          <h3 class="text-lg font-semibold text-card-foreground">
            Whales
          </h3>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          Top Collectors by NFT Count
        </p>

        <div class="space-y-3">
          <div
            v-for="collector in topCollectors.slice(0, 3)"
            :key="collector.address"
            class="flex items-center gap-3"
          >
            <UserInfo
              :avatar-size="32"
              :address="collector.address"
              custom-name
              transparent-background
              class="flex items-center gap-3 flex-1"
            >
              <template #name="{ addressName }">
                <div class="flex-1">
                  <p class="font-medium text-card-foreground text-sm">
                    {{ addressName }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ collector.items }} NFTs
                  </p>
                </div>
              </template>
            </UserInfo>
          </div>
        </div>
      </div>

      <!-- Early Adopters Section -->
      <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trending-up" class="text-muted-foreground size-5" />
          <h3 class="text-lg font-semibold text-card-foreground">
            Early Adopters
          </h3>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          First Collectors
        </p>

        <div class="space-y-3">
          <div
            v-for="adopter in earlyCollectors.slice(0, 3)"
            :key="adopter.address"
            class="flex items-center gap-3"
          >
            <UserInfo
              :avatar-size="32"
              :address="adopter.address"
              custom-name
              transparent-background
              class="flex items-center gap-3 flex-1"
            >
              <template #name="{ addressName }">
                <div class="flex-1">
                  <p class="font-medium text-card-foreground text-sm">
                    {{ addressName }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ adopter.items }} NFTs
                  </p>
                </div>
              </template>
            </UserInfo>
          </div>
        </div>
      </div>

      <!-- Collection Stats Section -->
      <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-2 mb-4">
          <UIcon name="i-lucide-bar-chart-3" class="text-muted-foreground size-5" />
          <h3 class="text-lg font-semibold text-card-foreground">
            Collection Stats
          </h3>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Floor Price</span>
            <span class="font-semibold text-card-foreground">
              {{ props.collectionStats?.floorPrice ? `${(props.collectionStats.floorPrice / 1e12).toFixed(3)} DOT` : 'No listings' }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Listed Ratio</span>
            <span class="font-semibold text-card-foreground">{{ props.collectionStats?.listedPercentage || '0%' }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Unique Holders</span>
            <span class="font-semibold text-card-foreground">{{ props.collectionStats?.collectionStats.uniqueHolders.toLocaleString() || '0' }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Avg. per Holder</span>
            <span class="font-semibold text-card-foreground">{{ props.collectionStats?.collectionStats.avgPerHolder || '0 NFTs' }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Holder Ratio</span>
            <span class="font-semibold text-card-foreground">{{ props.collectionStats?.collectionStats.holderRatio || '0%' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- All Collectors Section -->
    <div v-if="!props.isLoading && props.collectionStats && allCollectors.length > 0" class="bg-card border border-border rounded-xl p-6">
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-card-foreground">
          All Collectors
        </h3>
      </div>

      <!-- Collectors Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div
          v-for="collector in allCollectors"
          :key="collector.address"
        >
          <!-- Header: Avatar, Name, Activity Status -->
          <div class="flex items-start gap-4 relative">
            <!-- Badges for special collectors -->
            <div
              v-if="isTopCollector(collector) || isEarlyCollector(collector)"
              class="absolute -top-1 -right-1 z-10 flex flex-col gap-1"
            >
              <div
                v-if="isTopCollector(collector)"
                class="bg-foreground text-background text-xs px-2 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1"
              >
                <UIcon name="i-lucide-crown" class="size-3" />
                Whale
              </div>
              <div
                v-if="isEarlyCollector(collector)"
                class="bg-foreground text-background text-xs px-2 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1"
              >
                <UIcon name="i-lucide-zap" class="size-3" />
                Early
              </div>
            </div>

            <UserInfo
              :avatar-size="56"
              :address="collector.address"
              custom-name
              transparent-background
              class="bg-card border rounded-lg p-2 hover:shadow transition-all duration-200 w-full"
              :class="[
                (isTopCollector(collector) || isEarlyCollector(collector))
                  ? 'border-muted-foreground bg-muted/50 hover:shadow-md'
                  : 'border-border',
              ]"
            >
              <template #name="{ addressName }">
                <div class="flex flex-col gap-1">
                  <span
                    class="truncate"
                    :class="[
                      (isTopCollector(collector) || isEarlyCollector(collector))
                        ? 'text-foreground font-semibold'
                        : 'text-card-foreground font-semibold',
                    ]"
                  >
                    {{ addressName }}
                  </span>
                  <span
                    class="text-xs"
                    :class="[
                      (isTopCollector(collector) || isEarlyCollector(collector))
                        ? 'text-muted-foreground font-medium'
                        : 'text-muted-foreground',
                    ]"
                  >
                    {{ collector.items }} NFTs
                  </span>
                </div>
              </template>
            </UserInfo>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-if="!props.isLoading && (!props.collectionStats || allCollectors.length === 0)" class="text-center py-12">
      <UIcon name="i-lucide-users" class="size-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-card-foreground mb-2">
        No Collectors Yet
      </h3>
      <p class="text-muted-foreground max-w-md mx-auto">
        This collection doesn't have any collectors yet. Be the first to mint from this drop!
      </p>
    </div>
  </div>
</template>
