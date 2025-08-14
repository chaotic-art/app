<script setup lang="ts">
import type { DropItem } from '@/types'
import { formatBalance } from 'dedot/utils'
import { useMintedDropsStore } from '@/stores/dropsMinted'
import { calculateTokenUSD } from '@/utils/coinPrice'
import { getDropAttributes, isTBA } from './utils'

const props = defineProps<{
  drop: DropItem
  showMinted?: boolean
}>()

const { prefix } = usePrefix()
const formattedDrop = ref<DropItem>()

const shouldShowDrop = computed(() =>
  props.showMinted || (formattedDrop.value && !formattedDrop.value.isMintedOut),
)
const isUnlimited = computed(() => formattedDrop.value?.max && formattedDrop.value.max >= Number.MAX_SAFE_INTEGER)

// Format price for display
const formattedPrice = computed(() => {
  if (!formattedDrop.value?.price || isTBA(formattedDrop.value.price))
    return 'TBA'

  if (Number(formattedDrop.value.price) === 0)
    return 'Free'

  return formatBalance(formattedDrop.value.price, {
    decimals: decimalsOf(formattedDrop.value.chain || prefix.value),
    symbol: tokenSymbolOf(formattedDrop.value.chain || prefix.value),
  })
})

// Format USD equivalent
const formattedPriceUSD = computed(() => {
  if (!formattedDrop.value?.price || isTBA(formattedDrop.value.price) || Number(formattedDrop.value.price) === 0)
    return ''

  return calculateTokenUSD(formattedDrop.value.price, formattedDrop.value.chain || prefix.value)
})

// Badge text based on drop status
const badgeText = computed(() => {
  if (!formattedDrop.value)
    return ''

  const status = formattedDrop.value.status
  const isMintedOut = formattedDrop.value.isMintedOut

  if (status === 'minting_live')
    return 'Live Now'
  if (status === 'minting_ended' || isMintedOut)
    return 'Minted Out'
  return 'Coming Soon'
})

onBeforeMount(async () => {
  formattedDrop.value = await getDropAttributes(props.drop.alias)

  if (formattedDrop.value?.isMintedOut) {
    useMintedDropsStore().addMintedDrop(formattedDrop.value)
  }
})

const minted = computed(() => formattedDrop.value?.minted || 0)
</script>

<template>
  <NuxtLink v-if="shouldShowDrop" :to="`/${prefix}/drops/${drop.alias}`" class="relative shadow-xs border border-border rounded-xl overflow-hidden bg-background transition-all duration-300 hover:-translate-y-1 group">
    <!-- Badge -->
    <div class="absolute top-3 left-3 z-10">
      <UBadge>
        {{ badgeText }}
      </UBadge>
    </div>

    <!-- Image Section -->
    <div class="relative aspect-square">
      <img :src="sanitizeIpfsUrl(drop.image)" :alt="drop.name" class="w-full h-full object-cover">

      <!-- Collectors on Hover -->
      <div class="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-95">
        <UButton v-if="formattedDrop?.minted" icon="mdi:account-group" size="sm">
          <span>Collected by</span>
          <DropCollectedBy :chain="prefix" :collection-id="drop.collection" :max-address-count="3" size="small" no-background />
        </UButton>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-4 md:p-5">
      <!-- Title and Creator -->
      <div class="mb-4">
        <h3 class="font-bold text-lg md:text-xl mb-2 line-clamp-2 text-foreground">
          {{ drop.name }}
        </h3>

        <!-- Creator Section -->
        <div v-if="drop.creator" class="flex items-center gap-2 mb-3">
          <span class="text-xs text-muted-foreground font-medium">Created by</span>
          <UserInfo :avatar-size="20" :address="drop.creator" :transparent-background="true" class="min-w-0" />
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <!-- Price -->
        <div class="bg-muted rounded-lg p-3">
          <p class="text-xs text-muted-foreground mb-1 font-medium">
            Price
          </p>
          <p class="text-lg font-bold text-neutral-900 dark:text-white">
            {{ formattedPrice }}
          </p>
          <p v-if="formattedPriceUSD" class="text-xs text-neutral-500 dark:text-neutral-500">
            {{ formattedPriceUSD }}
          </p>
        </div>

        <!-- Supply -->
        <div class="bg-muted rounded-lg p-3">
          <p class="text-xs text-muted-foreground mb-1 font-medium">
            Supply
          </p>
          <p class="text-lg font-bold text-neutral-900 dark:text-white">
            <UIcon v-if="isUnlimited" name="mdi:infinity" class="text-lg text-neutral-600" />
            <span v-else>{{ formattedDrop?.max || 'Unknown' }}</span>
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-500">
            Total Items
          </p>
        </div>
      </div>

      <!-- Minting Progress -->
      <div class="mb-4">
        <div class="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Minted: {{ minted }}</span>
          <span>{{ formattedDrop?.max && !isUnlimited ? Math.round((minted / formattedDrop.max) * 100) : 0 }}%</span>
        </div>
        <UProgress v-model="minted" :max="formattedDrop?.max || 0" />
      </div>

      <!-- Action Button -->
      <UButton
        color="neutral"
        :variant="formattedDrop?.status === 'minting_live' ? 'solid' : 'outline'"
        class="w-full text-sm"
        size="md"
        block
      >
        {{ formattedDrop?.status === 'minting_live' ? 'Mint Now' : 'View Collection' }}
      </UButton>
    </div>
  </NuxtLink>
</template>
