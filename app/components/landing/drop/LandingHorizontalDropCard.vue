<script lang="ts" setup>
import type { DropItem } from '@/types'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

const props = defineProps<{
  drop?: DropItem
  description?: string
  claimed?: number
}>()

const { decimals, chainSymbol } = useChain()
const { usd: usdPrice } = useAmount(computed(() => props.drop?.price), decimals, chainSymbol)

const isLoading = computed(() => !props.drop)
</script>

<template>
  <div class="w-full rounded-xl overflow-hidden border border-[#EBEBEB] bg-white">
    <!-- Banner Image Section -->
    <div class="w-full h-[240px] md:h-[300px] bg-gray-200 relative">
      <div v-if="isLoading" class="w-full h-full bg-gray-200 animate-pulse" />
      <img
        v-else
        :src="sanitizeIpfsUrl(drop?.banner)"
        :alt="drop?.name"
        class="w-full h-full object-cover"
      >
    </div>

    <UContainer>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between py-4 md:py-6 px-4 md:px-0">
        <!-- Left Section: Title, Creator, Description -->
        <div class="flex flex-col gap-3 md:gap-4 w-full md:w-auto">
          <!-- Drop Name -->
          <div class="font-serif italic font-medium text-2xl md:text-[50px] text-center md:text-left">
            <div v-if="isLoading" class="h-8 md:h-16 bg-gray-200 animate-pulse rounded-md w-3/4 mx-auto md:mx-0" />
            <span v-else>{{ drop?.name }}</span>
          </div>

          <!-- Creator and Description -->
          <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full md:w-auto">
            <!-- Creator Info -->
            <div v-if="isLoading" class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-200 animate-pulse rounded-full" />
              <div class="flex flex-col gap-2">
                <div class="h-4 bg-gray-200 animate-pulse rounded w-24" />
                <div class="h-3 bg-gray-200 animate-pulse rounded w-32" />
              </div>
            </div>
            <UserInfo v-else :avatar-size="40" :address="drop?.creator" />

            <!-- Description -->
            <div class="text-gray-500 max-w-full md:max-w-[350px] line-clamp-3">
              <div v-if="isLoading" class="flex flex-col gap-2">
                <div class="h-3 bg-gray-200 animate-pulse rounded w-full" />
                <div class="h-3 bg-gray-200 animate-pulse rounded w-4/5" />
                <div class="h-3 bg-gray-200 animate-pulse rounded w-3/5" />
              </div>
              <MarkdownPreview v-else :source="description || ''" />
            </div>
          </div>
        </div>

        <!-- Right Section: Stats and Mint Button -->
        <div class="flex flex-col items-start md:items-end gap-4 mt-4 md:mt-0 w-full md:w-auto">
          <!-- Minted Stats and Price -->
          <div class="mb-1 flex items-center gap-3 flex-wrap">
            <template v-if="isLoading">
              <div class="h-4 bg-gray-200 animate-pulse rounded w-20" />
              <span class="font-bold text-gray-500">·</span>
              <div class="h-4 bg-gray-200 animate-pulse rounded w-16" />
            </template>
            <template v-else>
              <span class="font-medium">{{ claimed }}/{{ drop?.max }} {{ $t('drop.minted') }}</span>
              <span class="font-bold text-gray-500">·</span>
              <span class="font-medium">{{ usdPrice }} USD</span>
            </template>
          </div>

          <!-- Mint Button -->
          <div v-if="isLoading" class="h-12 bg-gray-200 animate-pulse rounded-lg w-32" />
          <LandingDropMintButton v-else :drop="drop" :is-minted-out="claimed === drop?.max" />
        </div>
      </div>
    </UContainer>
  </div>
</template>
