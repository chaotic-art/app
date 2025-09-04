<script setup lang="ts">
import { formatDetailedTimeToNow } from '~/utils/format/time'

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
            <span>{{ drop?.minted || 0 }} / {{ drop?.max || 10000 }} minted</span>
            <span>{{ mintingPercentage }}%</span>
          </div>
          <div class="w-full bg-secondary rounded-full h-2">
            <div
              class="bg-primary rounded-full h-2 transition-all duration-300"
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
          {{ drop?.collectionName || 'ENIGRAMS' }}
        </h1>

        <!-- Artist Info -->
        <div v-if="drop?.creator" class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <UserInfo :avatar-size="40" :address="drop?.creator" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-foreground">
              AOWISEONE
            </p>
            <p class="text-sm text-muted-foreground">
              Artist • 2.1K followers
            </p>
          </div>
          <FollowButton :target="drop?.creator" class="px-4 py-2" />
        </div>

        <!-- Description -->
        <div class="text-muted-foreground mb-8">
          <MarkdownPreview
            :source="drop?.collectionDescription || 'ENIGRAMS is a generative art collection that uses coded language getting aid from abstract geometry, creating visual ciphers filled with mysterious glyphs. Each piece feels like a secret waiting to be uncovered, inviting collectors to step into the chaos and find the hidden meaning within.'"
          />
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-4 gap-6 mb-8">
          <div class="text-center">
            <div class="size-10 mx-auto mb-2 flex items-center justify-center bg-muted rounded">
              <UIcon name="i-heroicons-squares-2x2" class="text-muted-foreground size-6" />
            </div>
            <p class="text-2xl font-bold text-foreground">
              {{ drop?.max || '10,000' }}
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
              1,234
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
              854 DOT
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
              28.47%
            </p>
            <p class="text-sm text-muted-foreground">
              Listed
            </p>
          </div>
        </div>

        <!-- Mint Section -->
        <div class="bg-card border border-border rounded-xl p-6">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-card-foreground">
              Mint {{ drop?.collectionName || 'ENIGRAMS' }}
            </h3>
          </div>

          <div class="mb-4">
            <p class="text-sm text-muted-foreground mb-1">
              Mint Price
            </p>
            <div class="flex items-baseline gap-2">
              <p class="text-2xl font-bold text-card-foreground">
                {{ formattedTokenPrice || '0.3 DOT' }}
              </p>
              <p class="text-muted-foreground">
                ${{ usdPrice || '38.40' }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-muted-foreground">
              Quantity
            </p>
            <div class="flex items-center gap-3">
              <UButton
                icon="i-heroicons-minus"
                variant="outline"
                size="sm"
                class="w-8 h-8"
                @click="amountToMint = Math.max(1, amountToMint - 1)"
              />
              <span class="text-lg font-medium w-8 text-center text-card-foreground">{{ amountToMint }}</span>
              <UButton
                icon="i-heroicons-plus"
                variant="outline"
                size="sm"
                class="w-8 h-8"
                @click="amountToMint = amountToMint + 1"
              />
            </div>
          </div>

          <div class="border-t border-border pt-4 mb-6">
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

          <DropMintButton
            :drop="drop"
            is-drop-page
            class="w-full"
          />
        </div>
      </div>
    </div>

    <USeparator class="my-12 md:my-20" />

    <DropItemsGrid
      v-if="drop.collection"
      :key="drop.collection"
      :collection-id="drop.collection"
    />
  </UContainer>

  <DropMintModal />
</template>
