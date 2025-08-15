<script setup lang="ts">
import type { DropItem } from '@/types'
import { useMintedDropsStore } from '@/stores/dropsMinted'
import { getDropAttributes, isTBA } from './utils'

const props = defineProps<{
  drop: DropItem
  showMinted?: boolean
}>()

const { prefix } = usePrefix()
const formattedDrop = ref<DropItem>()
const { decimals, chainSymbol } = useChain()

const shouldShowDrop = computed(() =>
  props.showMinted || (formattedDrop.value && !formattedDrop.value.isMintedOut),
)
const isUnlimited = computed(() => formattedDrop.value?.max && formattedDrop.value.max >= Number.MAX_SAFE_INTEGER)
const { usd: usdPrice } = useAmount(computed(() => formattedDrop.value?.price), decimals, chainSymbol)

onBeforeMount(async () => {
  formattedDrop.value = await getDropAttributes(props.drop.alias)

  if (formattedDrop.value?.isMintedOut) {
    useMintedDropsStore().addMintedDrop(formattedDrop.value)
  }
})
</script>

<template>
  <NuxtLink v-if="shouldShowDrop" :to="`/${prefix}/drops/${drop.alias}`" class="relative border rounded-xl border-gray-300 overflow-hidden hover:shadow-lg transition-shadow hover-card-effect group">
    <!-- Collectors on Hover -->
    <div class="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-95">
      <div v-if="formattedDrop?.minted" class="bg-secondary backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-2">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <UIcon name="mdi:account-group" class="text-gray-600 dark:text-gray-400 text-sm" />
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Collected by</span>
          </div>
          <DropCollectedBy :chain="prefix" :collection-id="drop.collection" :max-address-count="3" size="small" no-background />
        </div>
      </div>
    </div>

    <img :src="sanitizeIpfsUrl(drop.image)" :alt="drop.name" class="aspect-square w-full object-cover">

    <div class="p-3 md:p-4">
      <p class="font-bold text-base md:text-lg mb-1 md:mb-2 line-clamp-2">
        {{ drop.name }}
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
          <div class="text-right">
            <div v-if="isTBA(formattedDrop?.price)" class="px-2 py-1 bg-gray-100 rounded-md">
              <span class="text-xs font-medium text-gray-600">TBA</span>
            </div>
            <div v-else-if="Number(formattedDrop?.price)" class="flex items-baseline gap-1">
              <span class="text-sm font-semibold text-[var(--text-color)]">{{ usdPrice }}</span>
              <span class="text-xs text-gray-500">USD</span>
            </div>
            <div v-else class="px-2 py-1 bg-green-50 rounded-md">
              <span class="text-xs font-medium text-green-600">Free</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Creator Section -->
      <div v-if="drop.creator" class="mt-3 pt-3 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 font-medium">Created by</span>
          <UserInfo :avatar-size="20" :address="drop.creator" :transparent-background="true" class="min-w-0" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
