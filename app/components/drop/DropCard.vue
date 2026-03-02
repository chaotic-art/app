<script setup lang="ts">
import type { DropItem } from '@/types'
import type { GenartDropItem } from '~/types/genart'
import { useMintedDropsStore } from '@/stores/dropsMinted'
import ImageMedia from '~/components/common/ImageMedia.vue'
import { getDropAttributes, isTBA } from './utils'

const props = defineProps<{
  drop: GenartDropItem | DropItem
  showMinted?: boolean
}>()

const formattedDrop = ref<DropItem>()
const { decimals, chainSymbol, currentChain } = useChain()

const isDropLoading = ref(true)
const hasDropData = computed(() => formattedDrop.value !== undefined)
const shouldShowDrop = computed(() =>
  isDropLoading.value
  || props.showMinted
  || (hasDropData.value && !formattedDrop.value?.isMintedOut),
)
const isUnlimited = computed(() => formattedDrop.value?.max && formattedDrop.value.max >= Number.MAX_SAFE_INTEGER)
const usdPrice = computed(() => tokenToUsd(Number(formattedDrop.value?.price), decimals.value, chainSymbol.value))

onBeforeMount(async () => {
  try {
    formattedDrop.value = await getDropAttributes(props.drop.alias)

    if (formattedDrop.value?.isMintedOut) {
      useMintedDropsStore().addMintedDrop(formattedDrop.value)
    }
  }
  catch (error) {
    console.error('Failed to load drop attributes', { alias: props.drop.alias, error })
    formattedDrop.value = undefined
  }
  finally {
    isDropLoading.value = false
  }
})
</script>

<template>
  <div v-if="shouldShowDrop" class="relative border rounded-xl border-border overflow-hidden hover:shadow-lg transition-shadow hover-card-effect group">
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

    <NuxtLink :to="`/${currentChain}/drops/${drop.alias}`" class="block">
      <ImageMedia
        :src="sanitizeIpfsUrl(formattedDrop?.image) || '/placeholder.jpg'"
        :alt="formattedDrop?.name || drop.alias"
        class="aspect-square w-full object-cover"
      />

      <div class="p-3 md:p-4">
        <div v-if="isDropLoading" class="mb-1 md:mb-2">
          <USkeleton class="h-6 w-2/4 rounded" />
        </div>
        <p v-else-if="hasDropData" class="font-bold text-base md:text-lg mb-1 md:mb-2 line-clamp-2">
          {{ formattedDrop?.name }}
        </p>
        <p v-else class="font-bold text-base md:text-lg mb-1 md:mb-2 line-clamp-2">
          {{ drop.alias }}
        </p>

        <div class="flex items-center justify-between mt-3">
          <!-- Minting Progress -->
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1 text-xs text-gray-500">
              <span class="font-medium">Minted</span>
            </div>
            <div v-if="isDropLoading" class="h-5 flex items-center">
              <USkeleton class="h-4 w-20 rounded" />
            </div>
            <div v-else-if="hasDropData" class="flex items-center gap-1 font-mono">
              <span class="text-sm font-semibold text-[var(--text-color)]">{{ formattedDrop?.minted }}</span>
              <span class="text-xs text-gray-400">/</span>
              <UIcon v-if="isUnlimited" name="mdi:infinity" class="text-sm text-gray-600" />
              <span v-else class="text-sm text-gray-600">{{ formattedDrop?.max }}</span>
            </div>
            <div v-else class="flex items-center gap-1 font-mono">
              <span class="text-sm text-gray-600">N/A</span>
              <span class="text-xs text-gray-400">/</span>
              <span class="text-sm text-gray-600">N/A</span>
            </div>
          </div>

          <!-- Price Display -->
          <div class="flex flex-col items-end gap-1">
            <div class="text-xs text-gray-500 font-medium">
              Price
            </div>
            <div class="flex items-center gap-1">
              <div v-if="isDropLoading" class="h-5 flex items-center">
                <USkeleton class="h-5 w-16 rounded" />
              </div>
              <UBadge v-else-if="hasDropData && isTBA(formattedDrop?.price)" label="TBA" size="sm" color="neutral" variant="soft" />
              <div v-else-if="hasDropData && Number(formattedDrop?.price)" class="flex items-baseline gap-1">
                <span class="text-sm font-semibold text-[var(--text-color)]">{{ usdPrice }}</span>
                <span class="text-xs text-gray-500">USD</span>
              </div>
              <UBadge v-else-if="hasDropData" label="Free" size="sm" color="success" variant="soft" />
              <UBadge v-else label="N/A" size="sm" color="neutral" variant="soft" />
            </div>
          </div>
        </div>
      </div>
    </NuxtLink>

    <!-- Creator Section -->
    <div v-if="drop.creator" class="px-3 md:px-4 pb-3 md:pb-4 border-t border-border">
      <div class="flex items-center gap-2 pt-3">
        <span class="text-xs text-gray-500 font-medium">Created by</span>
        <div class="min-w-0">
          <UserInfo :avatar-size="20" :address="drop.creator" :transparent-background="true" class="min-w-0" />
        </div>
      </div>
    </div>
  </div>
</template>
