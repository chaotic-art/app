<script setup lang="ts">
import type { DropItem } from '~/types'

interface Props {
  drop?: DropItem
}

const props = withDefaults(defineProps<Props>(), {
  drop: undefined,
})

// Types for collector data
interface Collector {
  address: string
  items: number
}

interface CollectionStats {
  uniqueHolders: number
  avgPerHolder: string
  holderRatio: string
}

// Reactive data for collectors
const topCollectors = ref<Collector[]>([])
const earlyCollectors = ref<Collector[]>([])
const allCollectors = ref<Collector[]>([])
const collectionStats = ref<CollectionStats>({
  uniqueHolders: 0,
  avgPerHolder: '0 NFTs',
  holderRatio: '0%',
})
const isLoading = ref(true)

// Types for query data based on actual API response
interface QueryItem {
  keyArgs: [number, number] // [collection_id, token_id]
  value: {
    owner: string // Owner address
    approvals?: Array<[string, number | undefined]>
    deposit?: {
      account: string
      amount: bigint
    }
    [key: string]: any // Other properties
  }
}

// Process NFT ownership data
function processCollectorData(queryItems: QueryItem[]) {
  if (!queryItems || !Array.isArray(queryItems) || queryItems.length === 0)
    return

  // Group items by owner
  const ownershipMap = new Map<string, Collector>()
  const ownerTokenIds: Array<{ owner: string, tokenId: number }> = []

  queryItems.forEach((item) => {
    // Validate item structure
    if (!item || typeof item !== 'object' || !item.keyArgs || !item.value) {
      console.warn('Invalid item structure:', item)
      return
    }

    const { keyArgs, value } = item

    // Validate keyArgs and value
    if (!Array.isArray(keyArgs) || keyArgs.length < 2 || !value || !value.owner) {
      console.warn('Invalid keyArgs or value structure:', { keyArgs, value })
      return
    }

    const owner = value.owner.toString()
    const tokenId = Number(keyArgs[1]) // Token ID is second element in keyArgs

    // Validate tokenId is a valid number
    if (Number.isNaN(tokenId)) {
      console.warn('Invalid token ID:', keyArgs[1])
      return
    }

    if (!ownershipMap.has(owner)) {
      ownershipMap.set(owner, {
        address: owner,
        items: 0,
      })
    }

    ownershipMap.get(owner)!.items++

    // Track token IDs for early adopter detection
    ownerTokenIds.push({
      owner,
      tokenId,
    })
  })

  // Only proceed if we have valid ownership data
  if (ownershipMap.size === 0) {
    console.warn('No valid collector data found')
    return
  }

  try {
    // Convert to array and sort by items owned (descending)
    const sortedCollectors = Array.from(ownershipMap.values())
      .sort((a, b) => b.items - a.items)

    // Set top collectors (top 3)
    topCollectors.value = sortedCollectors.slice(0, 3)

    // Set early collectors (owners with smallest token IDs)
    if (ownerTokenIds.length > 0) {
      const sortedByTokenId = ownerTokenIds
        .sort((a, b) => a.tokenId - b.tokenId)
        .reduce((acc: Collector[], item) => {
          if (!acc.find(c => c.address === item.owner)) {
            const collector = ownershipMap.get(item.owner)
            if (collector) {
              acc.push(collector)
            }
          }
          return acc
        }, [])
        .slice(0, 3)

      earlyCollectors.value = sortedByTokenId
    }

    // Set all collectors
    allCollectors.value = sortedCollectors

    // Calculate collection stats
    const totalItems = sortedCollectors.reduce((sum, c) => sum + c.items, 0)
    const uniqueHolders = sortedCollectors.length

    collectionStats.value = {
      uniqueHolders,
      avgPerHolder: uniqueHolders > 0 ? `${(totalItems / uniqueHolders).toFixed(1)} NFTs` : '0 NFTs',
      holderRatio: props.drop?.max ? `${((uniqueHolders / Number(props.drop.max)) * 100).toFixed(1)}%` : '0%',
    }

    console.warn('Collector data processed successfully:', {
      totalCollectors: uniqueHolders,
      totalItems,
      topCollectors: topCollectors.value.length,
      earlyCollectors: earlyCollectors.value.length,
    })
  }
  catch (error) {
    console.error('Error processing collector data:', error)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!props.drop?.collection) {
    isLoading.value = false
    return
  }

  try {
    const { $sdk } = useNuxtApp()
    const api = $sdk('ahp').api

    const [queryItemsResult, queryFloor] = await Promise.all([
      api.query.Nfts.Item.getEntries(Number(props.drop.collection)),
      api.query.Nfts.ItemPriceOf.getEntries(Number(props.drop.collection)),
    ])

    console.warn('Query Items:', queryItemsResult)
    console.warn('Query Floor:', queryFloor)

    // Log the first few items to understand the structure
    if (queryItemsResult && queryItemsResult.length > 0 && queryItemsResult[0]) {
      console.warn('First item structure:', queryItemsResult[0])
      console.warn('First item keys:', Object.keys(queryItemsResult[0]))
    }

    // Type cast the query result to our expected format
    const queryItems = queryItemsResult as QueryItem[]

    // Process the collector data
    processCollectorData(queryItems)
  }
  catch (error) {
    console.error('Error fetching collector data:', error)
  }
  finally {
    isLoading.value = false
  }
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
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-muted-foreground border-t-transparent mb-4" />
      <p class="text-muted-foreground">
        Loading collector data...
      </p>
    </div>

    <!-- Top Section: Whales, Early Adopters, Collection Stats -->
    <div v-if="!isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Whales Section -->
      <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-crown" class="text-muted-foreground size-5" />
          <h3 class="text-lg font-semibold text-card-foreground">
            Whales
          </h3>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          Top Collectors
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

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Unique Holders</span>
            <span class="font-semibold text-card-foreground">{{ collectionStats.uniqueHolders.toLocaleString() }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Avg. per Holder</span>
            <span class="font-semibold text-card-foreground">{{ collectionStats.avgPerHolder }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Holder Ratio</span>
            <span class="font-semibold text-card-foreground">{{ collectionStats.holderRatio }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- All Collectors Section -->
    <div v-if="!isLoading" class="bg-card border border-border rounded-xl p-6">
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
  </div>
</template>
