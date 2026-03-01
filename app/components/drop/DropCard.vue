<script setup lang="ts">
import type { DropItem } from '@/types'
import type { GenartDropItem } from '~/types/genart'
import { useMintedDropsStore } from '@/stores/dropsMinted'
import { getDropAttributes, isTBA } from './utils'

const props = defineProps<{
  drop: GenartDropItem | DropItem
  showMinted?: boolean
}>()

const formattedDrop = ref<DropItem>()
const { decimals, chainSymbol, currentChain } = useChain()

const shouldShowDrop = computed(() =>
  props.showMinted || (formattedDrop.value && !formattedDrop.value.isMintedOut),
)
const isUnlimited = computed(() => formattedDrop.value?.max && formattedDrop.value.max >= Number.MAX_SAFE_INTEGER)
const usdPrice = computed(() => tokenToUsd(Number(formattedDrop.value?.price), decimals.value, chainSymbol.value))

onBeforeMount(async () => {
  formattedDrop.value = await getDropAttributes(props.drop.alias)

  if (formattedDrop.value?.isMintedOut) {
    useMintedDropsStore().addMintedDrop(formattedDrop.value)
  }
})
</script>

<template>
  <NuxtLink v-if="shouldShowDrop" :to="`/${currentChain}/drops/${drop.alias}`" class="relative border rounded-xl border-border overflow-hidden hover:shadow-lg transition-shadow hover-card-effect group">
    <!-- Collectors on Hover -->
    <div class="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-95">
      <div v-if="formattedDrop?.minted" class="bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <UIcon name="mdi:account-group" class="text-gray-600 dark:text-gray-400 text-sm" />
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Collected by</span>
          </div>
          <DropCollectedBy :chain="currentChain" :collection-id="drop.collection" :max-address-count="3" size="small" no-background />
        </div>
      </div>
    </div>

    <img
      :src="sanitizeIpfsUrl(formattedDrop?.image) || '/placeholder.jpg'"
      :alt="formattedDrop?.name || drop.alias"
      class="aspect-square w-full object-cover"
    >

    <div class="p-3 md:p-4">
      <p class="font-bold text-base md:text-lg mb-1 md:mb-2 line-clamp-2">
        {{ formattedDrop?.name }}
      </p>

      <div class="flex items-center justify-between mt-3">
        <!-- Minting Progress -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-xs text-gray-500">
            <span class="font-medium">Minted</span>
          </div>
          <div class="flex items-center gap-1 font-mono">
            <span class="text-sm font-semibold text-[var(--text-color)]">{{ formattedDrop?.minted }}</span>
            <span class="text-xs text-gray-400">/</span>
            <UIcon v-if="isUnlimited" name="mdi:infinity" class="text-sm text-gray-600" />
            <span v-else class="text-sm text-gray-600">{{ formattedDrop?.max }}</span>
          </div>
        </div>

        <!-- Price Display -->
        <div class="flex flex-col items-end gap-1">
          <div class="text-xs text-gray-500 font-medium">
            Price
          </div>
          <div class="flex items-center gap-1">
            <UBadge v-if="isTBA(formattedDrop?.price)" label="TBA" size="sm" color="neutral" variant="soft" />
            <div v-else-if="Number(formattedDrop?.price)" class="flex items-baseline gap-1">
              <span class="text-sm font-semibold text-[var(--text-color)]">{{ usdPrice }}</span>
              <span class="text-xs text-gray-500">USD</span>
            </div>
            <UBadge v-else label="Free" size="sm" color="success" variant="soft" />
          </div>
        </div>
      </div>

      <!-- Creator Section -->
      <div v-if="drop.creator" class="mt-3 pt-3 border-t border-border">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 font-medium">Created by</span>
          <UserInfo :avatar-size="20" :address="drop.creator" :transparent-background="true" class="min-w-0" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
