<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OdaToken, OnchainCollection } from '~/services/oda'
import { refreshOdaTokenMetadata } from '~/services/oda'

interface Props {
  tokenData: OdaToken | null
  collection: OnchainCollection | null
  chain: AssetHubChain
  collectionId: string
  tokenId: string
  owner?: string
  collectionCreator?: string
  formattedPrice?: string
  usdPrice?: string
}

const props = defineProps<Props>()

const toast = useToast()

// Action methods
function shareToken() {
  if (navigator.share) {
    navigator.share({
      title: props.tokenData?.metadata?.name || 'NFT',
      text: props.tokenData?.metadata?.description || '',
      url: window.location.href,
    })
  }
  else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href)
    toast.add({ title: 'Link copied to clipboard' })
  }
}

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

// Action items for dropdown menu
const actionItems = computed(() => [
  [
    {
      label: 'Share',
      icon: 'i-heroicons-share',
      onSelect: shareToken,
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
])
</script>

<template>
  <div class="space-y-6">
    <div>
      <!-- Collection Information -->
      <div v-if="collection" class="flex items-center gap-2">
        <NuxtLink
          :to="`/${chain}/collection/${collectionId || ''}`"
          class="font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
        >
          <UIcon name="i-heroicons-rectangle-stack" class="w-4 h-4" />
          {{ collection.metadata?.name || `Collection ${collectionId || ''}` }}
        </NuxtLink>
      </div>

      <!-- Title with Action Dropdown -->
      <div class="flex items-center justify-between gap-3 md:gap-4">
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight flex-1 min-w-0">
          {{ tokenData?.metadata?.name || 'Untitled NFT' }}
        </h1>

        <!-- Action Dropdown Menu -->
        <UDropdownMenu
          :items="actionItems"
          :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
          :ui="{ content: 'w-48' }"
        >
          <UButton
            color="neutral"
            size="sm"
            class="h-7 w-7"
            icon="i-heroicons-ellipsis-horizontal"
          />
        </UDropdownMenu>
      </div>
    </div>

    <!-- Description -->
    <div v-if="tokenData?.metadata?.description" class="space-y-2 line-clamp-6">
      <MarkdownPreview :source="tokenData.metadata.description" />
    </div>

    <!-- Creator and Owner Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Creator Card -->
      <div class="p-6 bg-secondary rounded-md space-y-2">
        <p class="font-bold">
          Collection Creator
        </p>
        <UserInfo :size="40" :address="collectionCreator || undefined" transparent-background custom-name>
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
      <div class="p-6 bg-secondary rounded-md space-y-2">
        <p class="font-bold">
          Owner
        </p>
        <UserInfo :size="40" :address="owner || undefined" transparent-background custom-name>
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
    </div>

    <div class="space-y-3 bg-secondary rounded-md p-6">
      <!-- Current Price Section -->
      <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
        Current Price
      </p>
      <div class="flex items-baseline gap-2">
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ formattedPrice || 'Not for sale' }}
        </p>
        <p v-if="formattedPrice && usdPrice" class="text-sm text-gray-500 dark:text-gray-400">
          ({{ usdPrice }})
        </p>
      </div>
    </div>
  </div>
</template>
