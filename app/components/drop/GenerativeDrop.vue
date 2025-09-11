<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { SocialLink } from '~/services/profile'
import { formatBalance } from 'dedot/utils'
import { fetchFollowersOf, fetchProfileByAddress } from '~/services/profile'
import { formatDetailedTimeToNow } from '~/utils/format/time'
import { unlimited } from '~/utils/math'
import { dropStats } from './utils'

const { drop, amountToMint } = storeToRefs(useDropStore())

const { decimals, chainSymbol } = useChain()
const dropPreviewRef = ref()
const { usd: usdPrice, formatted: formattedTokenPrice } = useAmount(computed(() => drop.value?.price), decimals, chainSymbol)

// Share functionality
function shareVariant() {
  if (navigator.share) {
    navigator.share({
      title: `${drop.value?.collectionName || 'ENIGRAMS'} - Generative Art`,
      text: `Check out this generative art collection: ${drop.value?.collectionName || 'ENIGRAMS'}`,
      url: window.location.href,
    })
  }
  else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href)
    // You might want to show a toast notification here
  }
}

// Preview variant in new tab
function previewVariantInNewTab() {
  const previewItem = dropPreviewRef.value?.previewItem
  if (previewItem?.image) {
    const sanitizedUrl = sanitizeIpfsUrl(previewItem.image, 'nftStorage')
    window.open(sanitizedUrl, '_blank')
  }
}

// Calculate minting percentage
const mintingPercentage = computed(() => {
  if (!drop.value?.max || !drop.value?.minted)
    return 0
  return Math.round((Number(drop.value.minted) / Number(drop.value.max)) * 100)
})

// Check if drop is minted out
const isMintedOut = computed(() => {
  return drop.value?.isMintedOut || false
})

const dropStartRelativeTime = computed(() => {
  let targetDate: Date | null = null

  if (drop.value?.dropStartTime) {
    targetDate = new Date(drop.value.dropStartTime)
  }
  else if (drop.value?.start_at) {
    targetDate = new Date(drop.value.start_at)
  }

  if (!targetDate) {
    return null
  }

  // Don't show time if it's already in the past
  const now = new Date()
  if (targetDate.getTime() < now.getTime()) {
    return null
  }

  return formatDetailedTimeToNow(targetDate)
})

// Tabs configuration
const activeTab = ref('items')

const tabItems = ref<TabsItem[]>([
  {
    label: 'Items',
    value: 'items',
    icon: 'i-lucide-grid-3x3',
  },
  {
    label: 'Collectors',
    value: 'collectors',
    icon: 'i-lucide-users',
  },
  {
    label: 'About',
    value: 'about',
    icon: 'i-lucide-info',
  },
])

// Artist info
const artistDescription = ref('')
const followersCount = ref(0)
const socials = ref<SocialLink[]>([])

watchEffect(async () => {
  if (!drop.value?.creator) {
    return
  }

  const [profile, followers] = await Promise.all([
    fetchProfileByAddress(drop.value.creator),
    fetchFollowersOf(drop.value.creator),
  ])

  followersCount.value = followers.totalCount
  socials.value = profile.socials
  artistDescription.value = profile.description
})

// Drop stats
const collectionStats = ref<Awaited<ReturnType<typeof dropStats>>>()

watchEffect(async () => {
  if (!drop.value?.collection) {
    return
  }

  const stats = await dropStats(drop.value.collection)
  collectionStats.value = stats
})
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <!-- Left side - Preview -->
      <div class="order-2 lg:order-1">
        <div class="relative">
          <!-- Preview Item -->
          <ClientOnly>
            <DropPreviewItem ref="dropPreviewRef" />
          </ClientOnly>
        </div>

        <!-- Actions & Minting Progress -->
        <div class="mt-6 bg-card border border-border rounded-xl p-4">
          <!-- Actions Section -->
          <div class="flex items-center justify-between mb-4">
            <UButton
              variant="soft"
              trailing-icon="i-lucide-refresh-cw"
              :loading="dropPreviewRef?.isCapturingImage"
              class="text-xs md:text-sm"
              @click="dropPreviewRef?.generateNft()"
            >
              Preview Variation
            </UButton>

            <div class="flex gap-2">
              <!-- Love button hidden for now -->
              <!-- <UButton
                icon="i-heroicons-heart"
                variant="ghost"
                class="size-8"
              /> -->
              <UButton
                icon="i-heroicons-share"
                variant="ghost"
                class="size-8"
                @click="shareVariant"
              />
              <UButton
                icon="i-heroicons-arrow-top-right-on-square"
                variant="ghost"
                class="size-8"
                @click="previewVariantInNewTab"
              />
            </div>
          </div>

          <!-- Separator -->
          <div class="border-t border-border mb-4" />

          <!-- Minting Progress -->
          <div class="flex items-center justify-between text-sm mb-3 text-card-foreground">
            <span>{{ drop?.minted || 0 }} / {{ unlimited(drop?.max?.toString()) ? '∞' : (drop?.max || 10000) }} minted</span>
            <div class="flex items-center gap-2">
              <span>{{ mintingPercentage }}%</span>
              <UBadge v-if="isMintedOut" variant="outline" class="text-xs bg-muted text-muted-foreground">
                Sold Out
              </UBadge>
            </div>
          </div>
          <div class="w-full bg-secondary rounded-full h-2">
            <div
              class="rounded-full h-2 transition-all duration-300"
              :class="isMintedOut ? 'bg-muted-foreground' : 'bg-primary'"
              :style="{ width: `${mintingPercentage}%` }"
            />
          </div>
        </div>

        <!-- drop start at section -->
        <div v-if="dropStartRelativeTime" class="mt-6 p-4 bg-muted rounded-lg border border-border">
          <h3 class="text-lg font-semibold text-foreground mb-2">
            Drop Start Time
          </h3>
          <div class="flex items-center gap-2 text-muted-foreground">
            <UIcon name="i-heroicons-clock" class="w-4 h-4" />
            <time
              v-if="drop?.dropStartTime"
              :datetime="drop.dropStartTime.toISOString()"
              class="capitalize"
            >
              {{ dropStartRelativeTime }}
            </time>
            <time
              v-else-if="drop?.start_at"
              :datetime="drop.start_at"
              class="capitalize"
            >
              {{ dropStartRelativeTime }}
            </time>
          </div>
        </div>
      </div>

      <!-- Right side - Content -->
      <div class="order-1 lg:order-2">
        <!-- Badges -->
        <div class="flex gap-2 mb-6">
          <UBadge class="rounded-full bg-secondary text-secondary-foreground px-3 py-1">
            Polkadot
          </UBadge>
          <UBadge class="rounded-full bg-secondary text-secondary-foreground px-3 py-1">
            Generative Art
          </UBadge>
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
          {{ drop?.collectionName || '' }}
        </h1>

        <!-- Artist Info -->
        <div v-if="drop?.creator" class="flex items-center gap-3 mb-6">
          <UserInfo
            :avatar-size="48"
            :address="drop?.creator"
            custom-name
            transparent-background
            class="flex items-center gap-3 flex-1"
          >
            <template #name="{ addressName }">
              <div>
                <p class="font-medium text-foreground">
                  {{ addressName }}
                </p>
                <p class="text-sm text-muted-foreground">
                  Artist • {{ followersCount }} followers
                </p>
              </div>
              <FollowButton :target="drop?.creator" class="px-4 py-2" />
            </template>
          </UserInfo>
        </div>

        <!-- Description -->
        <div class="mb-8">
          <MarkdownPreview
            :source="drop?.collectionDescription || ''" class="line-clamp-6"
          />
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-4 gap-6 mb-8">
          <div class="text-center">
            <div class="size-10 mx-auto mb-2 flex items-center justify-center bg-muted rounded">
              <UIcon name="i-heroicons-squares-2x2" class="text-muted-foreground size-6" />
            </div>
            <p class="text-2xl font-bold text-foreground">
              {{ unlimited(drop?.max?.toString()) ? '∞' : (drop?.max || '10,000') }}
            </p>
            <p class="text-sm text-muted-foreground">
              Total Supply
            </p>
          </div>
          <div class="text-center">
            <div class="size-10 mx-auto mb-2 flex items-center justify-center bg-muted rounded">
              <UIcon name="i-heroicons-users" class="text-muted-foreground size-6" />
            </div>
            <p class="text-2xl font-bold text-foreground">
              {{ collectionStats?.collectionStats.uniqueHolders.toLocaleString() || '0' }}
            </p>
            <p class="text-sm text-muted-foreground">
              Collectors
            </p>
          </div>
          <div class="text-center">
            <div class="size-10 mx-auto mb-2 flex items-center justify-center bg-muted rounded">
              <UIcon name="i-heroicons-chart-bar" class="text-muted-foreground size-6" />
            </div>
            <p class="text-2xl font-bold text-foreground">
              {{ formatBalance(collectionStats?.floorPrice || '0', { decimals, symbol: chainSymbol }) }}
            </p>
            <p class="text-sm text-muted-foreground">
              Floor Price
            </p>
          </div>
          <div class="text-center">
            <div class="size-10 mx-auto mb-2 flex items-center justify-center bg-muted rounded">
              <UIcon name="i-heroicons-clock" class="text-muted-foreground size-6" />
            </div>
            <p class="text-2xl font-bold text-foreground">
              {{ collectionStats?.listedPercentage || '0%' }}
            </p>
            <p class="text-sm text-muted-foreground">
              Listed
            </p>
          </div>
        </div>

        <!-- Mint Section -->
        <div
          class="border rounded-xl p-6 transition-all duration-200"
          :class="[
            isMintedOut
              ? 'bg-muted border-muted opacity-75'
              : 'bg-card border-border',
          ]"
        >
          <div class="mb-4">
            <div class="flex items-center justify-between">
              <h3
                class="text-lg font-semibold"
                :class="isMintedOut ? 'text-muted-foreground' : 'text-card-foreground'"
              >
                {{ isMintedOut ? 'Sold Out' : `Mint ${drop?.collectionName || 'ENIGRAMS'}` }}
              </h3>
              <UBadge v-if="isMintedOut" variant="outline" class="bg-muted text-muted-foreground">
                Minted Out
              </UBadge>
            </div>
          </div>

          <!-- Mint Price and Quantity Side by Side -->
          <div v-if="!isMintedOut" class="mb-4">
            <!-- Mint Price Row -->
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm text-muted-foreground">
                Mint Price
              </p>
              <div class="flex flex-col items-end">
                <p class="text-2xl font-bold text-card-foreground">
                  {{ formattedTokenPrice || '0 DOT' }}
                </p>
                <p class="text-muted-foreground">
                  {{ usdPrice || '$0' }}
                </p>
              </div>
            </div>

            <!-- Quantity Row -->
            <div class="flex items-center justify-between">
              <p class="text-sm text-muted-foreground">
                Quantity
              </p>
              <UButtonGroup orientation="horizontal">
                <UButton
                  icon="i-heroicons-minus"
                  variant="outline"
                  @click="amountToMint = Math.max(1, amountToMint - 1)"
                />
                <UInput
                  v-model="amountToMint"
                  type="number"
                  min="1"
                  variant="outline"
                  class="w-16 text-center *:h-9 *:ring-ring"
                  :ui="{ base: 'text-center' }"
                />
                <UButton
                  icon="i-heroicons-plus"
                  variant="outline"
                  @click="amountToMint = amountToMint + 1"
                />
              </UButtonGroup>
            </div>
          </div>

          <!-- Mint Price Only (when minted out) -->
          <div v-else class="mb-4">
            <p class="text-sm text-muted-foreground mb-1">
              Mint Price
            </p>
            <div class="flex items-baseline gap-2">
              <p class="text-2xl font-bold text-card-foreground">
                {{ formattedTokenPrice || '0 DOT' }}
              </p>
              <p class="text-muted-foreground">
                {{ usdPrice || '$0' }}
              </p>
            </div>
          </div>

          <div v-if="!isMintedOut" class="border-t border-border pt-4 mb-6">
            <div class="flex items-center justify-between">
              <p class="font-semibold text-card-foreground">
                Total
              </p>
              <div class="text-right">
                <p class="text-xl font-bold text-card-foreground">
                  {{
                    formattedTokenPrice
                      ? `${(parseFloat(formattedTokenPrice.split(' ')[0] || '0') * amountToMint).toFixed(1)} DOT`
                      : `${(0.3 * amountToMint).toFixed(1)} DOT`
                  }}
                </p>
                <p class="text-sm text-muted-foreground">
                  ${{
                    usdPrice
                      ? (parseFloat((usdPrice || '').replace('$', '') || '0') * amountToMint).toFixed(2)
                      : (38.40 * amountToMint).toFixed(2)
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Minted Out Message -->
          <div v-if="isMintedOut" class="border-t border-muted pt-4 mb-6">
            <div class="text-center">
              <p class="text-muted-foreground text-sm mb-2">
                This drop has been completely minted out
              </p>
              <p class="text-muted-foreground text-xs">
                View existing listings in the collection
              </p>
            </div>
          </div>

          <DropMintButton
            :drop="drop"
            is-drop-page
            class="w-full"
          />
        </div>
      </div>
    </div>

    <USeparator class="my-12 md:my-20" />

    <!-- Tabs Section -->
    <UTabs
      v-model="activeTab"
      :items="tabItems"
      color="neutral"
      variant="pill"
      class="w-full mb-20"
    >
      <template #content="{ item }">
        <!-- Items Tab -->
        <div v-if="item.value === 'items'" class="mt-8">
          <DropItemsGrid
            v-if="drop.collection"
            :key="drop.collection"
            :collection-id="drop.collection"
          />
        </div>

        <!-- Collectors Tab -->
        <div v-else-if="item.value === 'collectors'" class="mt-8">
          <DropCollectors :drop="drop" :collection-stats="collectionStats" />
        </div>

        <!-- About Tab -->
        <div v-else-if="item.value === 'about'" class="mt-8">
          <DropAbout :drop="drop" :formatted-token-price="formattedTokenPrice" :socials="socials" :artist-description="artistDescription" :followers-count="followersCount" />
        </div>
      </template>
    </UTabs>
  </UContainer>

  <DropMintModal />
</template>
