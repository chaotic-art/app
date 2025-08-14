<script lang="ts" setup>
import type { DropItem } from '@/types'

const props = defineProps<{
  drop?: DropItem
}>()

const emit = defineEmits(['click'])
const { decimals, chainSymbol } = useChain()
const { usd: usdPrice } = useAmount(computed(() => props.drop?.price), decimals, chainSymbol)

const isLoading = computed(() => !props.drop)

useHead({
  link: [
    {
      rel: 'preload',
      href: ipfsToCfImageUrl(props.drop?.banner),
      as: 'image',
    },
  ],
})
</script>

<template>
  <div class="w-full rounded-xl overflow-hidden border border-border">
    <!-- Banner Image Section -->
    <div class="w-full h-[320px] md:h-[300px] bg-muted relative">
      <div v-if="isLoading" class="w-full h-full bg-muted animate-pulse" />
      <img
        v-else
        :src="ipfsToCfImageUrl(drop?.banner)"
        :alt="drop?.name"
        class="w-full h-full object-cover cursor-pointer"
        fetchpriority="high"
        @click="emit('click', drop)"
      >
    </div>

    <UContainer>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between py-4 md:py-6 px-4 md:px-0">
        <!-- Left Section: Title, Creator, Description -->
        <div class="flex flex-col gap-3 md:gap-4 w-full md:w-auto">
          <!-- Drop Name -->
          <div class="font-serif italic font-medium text-2xl md:text-[50px] text-center md:text-left text-foreground">
            <div v-if="isLoading" class="h-8 md:h-16 bg-muted animate-pulse rounded-md w-3/4 mx-auto md:mx-0" />
            <span v-else>{{ drop?.name }}</span>
          </div>

          <!-- Creator and Description -->
          <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full md:w-auto">
            <!-- Creator Info -->
            <div v-if="isLoading" class="flex items-center gap-3">
              <div class="w-10 h-10 bg-muted animate-pulse rounded-full" />
              <div class="flex flex-col gap-2">
                <div class="h-4 bg-muted animate-pulse rounded w-24" />
                <div class="h-3 bg-muted animate-pulse rounded w-32" />
              </div>
            </div>
            <UserInfo v-else :avatar-size="40" :address="drop?.creator" />

            <!-- Description -->
            <div class="text-muted-foreground max-w-full md:max-w-[350px] line-clamp-3">
              <div v-if="isLoading" class="flex flex-col gap-2">
                <div class="h-3 bg-muted animate-pulse rounded w-full" />
                <div class="h-3 bg-muted animate-pulse rounded w-4/5" />
                <div class="h-3 bg-muted animate-pulse rounded w-3/5" />
              </div>
              <MarkdownPreview v-else :source="drop?.collectionDescription || ''" />
            </div>
          </div>
        </div>

        <!-- Right Section: Stats and Mint Button -->
        <div class="flex flex-col items-start md:items-end gap-4 mt-4 md:mt-0 w-full md:w-auto">
          <!-- Minted Stats and Price -->
          <div class="mb-1 flex items-center gap-3 flex-wrap">
            <template v-if="isLoading">
              <div class="h-4 bg-muted animate-pulse rounded w-20" />
              <span class="font-bold text-muted-foreground">·</span>
              <div class="h-4 bg-muted animate-pulse rounded w-16" />
            </template>
            <template v-else>
              <span class="font-medium text-foreground">{{ drop?.minted }}/{{ drop?.max }} {{ $t('drop.minted') }}</span>
              <span class="font-bold text-muted-foreground">·</span>
              <span class="font-medium text-foreground">{{ usdPrice }} USD</span>
            </template>
          </div>

          <!-- Mint Button -->
          <div v-if="isLoading" class="h-12 bg-muted animate-pulse rounded-lg w-32" />
          <DropMintButton
            v-else
            class="w-fit md:w-auto"
            :drop="drop" size="sm"
          />
        </div>
      </div>
    </UContainer>
  </div>
</template>
