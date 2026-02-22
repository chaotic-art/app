<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { HighestNftOffer } from '../trade/types'
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OdaToken, OnchainCollection } from '~/services/oda'
import type { NftRarity } from '~/types/rarity'
import { t } from 'try'
import { refreshOdaTokenMetadata } from '~/services/oda'

interface Props {
  tokenData: OdaToken | null
  collection: OnchainCollection | null
  chain: AssetHubChain
  collectionId: string
  tokenId: string
  owner?: string
  collectionCreator?: string
  price: bigint | null
  formattedPrice?: string
  usdPrice?: string
  mimeType: string
  rarity?: NftRarity | null
  highestOffer: HighestNftOffer | null
}

const props = defineProps<Props>()

const toast = useToast()
const { decimals, chainSymbol } = useChain()

// collection owner for genart
const genartCreator = ref('')
const creator = computed(() => genartCreator.value || props.collectionCreator)

const { usd: highestOfferUsd, formatted: highestOfferFormatted } = useAmount(
  computed(() => props.highestOffer?.price || 0),
  decimals,
  chainSymbol,
)

onMounted(async () => {
  const [ok, _, drop] = await t($fetch('/api/genart/list', { query: { collection: props.collectionId } }))
  if (ok && drop.data[0]?.creator) {
    genartCreator.value = drop.data[0].creator
  }
})

async function handleRefreshMetadata() {
  try {
    toast.add({
      title: 'Refreshing metadata...',
      description: 'This may take a few moments',
    })

    await refreshOdaTokenMetadata(props.chain, props.collectionId, props.tokenId)

    toast.add({
      title: 'Metadata refreshed successfully',
      description: 'Please refresh the page to see updated metadata',
      color: 'success',
    })
  }
  catch (error) {
    console.error('Failed to refresh metadata:', error)
    toast.add({
      title: 'Failed to refresh metadata',
      description: 'Please try again later',
      color: 'error',
    })
  }
}

// burn action
const { canBurn, burnNow, canTransfer, transferNow } = useCartActions({
  tokenId: Number(props.tokenId),
  collectionId: Number(props.collectionId),
  chain: props.chain,
  token: computed(() => props.tokenData),
  collection: computed(() => props.collection),
  owner: computed(() => props.owner || null),
  price: computed(() => props.price || null),
  mimeType: computed(() => props.mimeType),
  highestOffer: computed(() => props.highestOffer),
})

const { shareOnX } = useSocialShare()

// Action items for dropdown menu
const actionItems = computed<DropdownMenuItem[]>(() => {
  const items: DropdownMenuItem[] = [
    [
      {
        label: 'Share on X',
        icon: 'i-simple-icons:x',
        onSelect: () => shareOnX(props.tokenData?.metadata?.name || 'NFT', window.location.href),
      },
    ],
    [
      {
        label: 'Refresh Metadata',
        icon: 'i-heroicons-arrow-path',
        onSelect: handleRefreshMetadata,
      },
      {
        label: 'Report',
        icon: 'i-heroicons-flag',
        onSelect: () => {},
        disabled: true,
      },
    ],
  ]

  if (canTransfer.value) {
    items[0]?.push({
      label: 'Transfer',
      icon: 'i-heroicons-paper-airplane',
      onSelect: transferNow,
    })
  }

  if (canBurn.value) {
    items[0]?.push({
      label: 'Burn',
      icon: 'i-heroicons-fire',
      onSelect: burnNow,
    })
  }

  return items
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <!-- Collection Information -->
      <div v-if="collection" class="flex items-center gap-2">
        <NuxtLink
          :to="`/${chain}/collection/${collectionId || ''}`"
          class="font-medium transition-colors flex items-center gap-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500"
        >
          <!-- Collection Image -->
          <div class="size-6 rounded-full overflow-hidden bg-muted flex shrink-0 items-center">
            <img
              v-if="collection.metadata?.image"
              :src="sanitizeIpfsUrl(collection.metadata.image)"
              :alt="collection.metadata?.name || 'Collection'"
              class="w-full h-full object-cover"
            >
            <UIcon
              v-else
              name="i-heroicons-rectangle-stack"
              class="size-4 text-muted-foreground m-auto"
            />
          </div>
          {{ collection.metadata?.name || `Collection ${collectionId || ''}` }}
        </NuxtLink>
      </div>

      <!-- Title with Action Dropdown -->
      <div class="flex items-center justify-between gap-3 md:gap-4">
        <div v-if="!tokenData" class="flex-1">
          <USkeleton class="h-12 md:h-16 lg:h-20 w-3/4 rounded-lg" />
        </div>
        <h1 v-else class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight flex-1 min-w-0">
          {{ tokenData?.metadata?.name || 'Untitled NFT' }}
        </h1>

        <!-- Action Dropdown Menu -->
        <div v-if="!tokenData">
          <USkeleton class="size-7 rounded-md" />
        </div>
        <UDropdownMenu
          v-else
          :items="actionItems"
          :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
          :ui="{ content: 'w-48' }"
        >
          <UButton
            variant="outline"
            size="sm"
            class="size-7"
            icon="i-heroicons-ellipsis-horizontal"
          />
        </UDropdownMenu>
      </div>

      <RarityRankChip :rarity="rarity" class="mt-3" />
    </div>

    <!-- Description -->
    <div v-if="tokenData?.metadata?.description" class="space-y-2">
      <MarkdownPreview :source="tokenData.metadata.description" />
    </div>

    <!-- Creator and Owner Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Creator Card -->
      <div class="p-6 bg-secondary rounded-md space-y-2">
        <p class="font-bold">
          Collection Creator
        </p>
        <div v-if="!creator" class="flex items-center gap-3">
          <USkeleton class="h-10 w-10 rounded-full" />
          <div class="space-y-2 flex-1">
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-3 w-20" />
          </div>
        </div>
        <UserInfo v-else :size="40" :address="creator" transparent-background custom-name>
          <template #name="{ addressName }">
            <div>
              <p class="font-bold">
                {{ addressName }}
              </p>
              <p>Digital Artist</p>
            </div>
          </template>
        </UserInfo>
      </div>

      <!-- Owner Card -->
      <div v-if="owner" class="p-6 bg-secondary rounded-md space-y-2">
        <p class="font-bold">
          Owner
        </p>
        <UserInfo :size="40" :address="owner" transparent-background custom-name>
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

      <!-- Highest Offer Section -->
      <div class="p-6 bg-secondary rounded-md space-y-2">
        <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Highest Offer
        </p>
        <div class="flex items-baseline gap-2">
          <p class="text-2xl font-bold text-foreground">
            {{ highestOffer ? highestOfferFormatted : 'No offers' }}
          </p>
          <p v-if="highestOffer" class="text-sm text-muted-foreground">
            ({{ highestOfferUsd }})
          </p>
        </div>
      </div>

      <!-- Current Price Section -->
      <div class="p-6 bg-secondary rounded-md space-y-2">
        <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Current Price
        </p>
        <div class="flex items-baseline gap-2">
          <p class="text-2xl font-bold text-foreground">
            {{ formattedPrice || 'Not for sale' }}
          </p>
          <p v-if="formattedPrice && usdPrice" class="text-sm text-muted-foreground">
            ({{ usdPrice }})
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
