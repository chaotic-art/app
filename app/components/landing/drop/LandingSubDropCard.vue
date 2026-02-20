<script lang="ts" setup>
import type { DropItem } from '@/types'
import { parseCETDate } from '@/components/drop/utils'
import { formatToNow } from '@/utils/format/time'

const props = defineProps<{
  drop?: DropItem
}>()
const emit = defineEmits(['click'])

const { getChainIcon } = useIcon()

const chainIcon = computed(() => getChainIcon(props.drop?.chain || null))
const { decimals, chainSymbol } = useChain()
const { usd: usdPrice } = useAmount(computed(() => props.drop?.price), decimals, chainSymbol)
</script>

<template>
  <div class="flex flex-col sm:flex-row rounded-xl h-auto md:h-[440px] overflow-hidden border border-border bg-card">
    <!-- Image container with better mobile sizing -->
    <div class="relative rounded-t-xl sm:rounded-l-xl sm:rounded-t-none overflow-hidden border-b sm:border-b-0 sm:border-r border-border cursor-pointer w-full sm:w-auto sm:aspect-square sm:h-full" @click="emit('click', drop)">
      <img
        :src="sanitizeIpfsUrl(drop?.banner)"
        :alt="drop?.name"
        class="w-full h-48 sm:h-full object-cover"
      >
    </div>

    <!-- Content container with improved mobile spacing -->
    <div class="p-4 sm:p-6 flex flex-col justify-between flex-1 min-h-0">
      <div class="flex flex-col gap-3 sm:gap-4">
        <!-- Title with better mobile typography -->
        <div class="font-serif italic line-clamp-2 sm:line-clamp-1 font-medium text-lg sm:text-xl md:text-[40px] text-left text-foreground leading-tight">
          {{ drop?.name }}
        </div>

        <!-- User info and follow button on one line -->
        <div class="flex justify-between items-center gap-2 mb-2">
          <UserInfo :address="drop?.creator" :avatar-size="30" class="h-[40px] flex-shrink-0" />
          <FollowButton
            :target="drop?.creator!"
            class="flex-shrink-0"
          />
        </div>

        <!-- Description with mobile-optimized line clamping -->
        <div class="text-muted-foreground max-w-full md:max-w-[300px] line-clamp-2 sm:line-clamp-3 md:line-clamp-4 text-sm sm:text-base">
          <MarkdownPreview :source="drop?.collectionDescription || ''" />
        </div>
      </div>

      <!-- Bottom section with improved mobile layout -->
      <div class="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-2">
        <!-- Stats section with single line mobile layout -->
        <div class="flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base">
          <div class="flex items-center gap-2">
            <span class="text-foreground whitespace-nowrap">{{ drop?.minted }}/{{ drop?.max }} {{ $t('drop.minted') }}</span>
            <span class="font-bold text-muted-foreground">·</span>
            <span class="text-foreground whitespace-nowrap">{{ usdPrice }} USD</span>
            <template v-if="drop?.chain">
              <span class="font-bold text-muted-foreground">·</span>
              <div class="flex items-center gap-1">
                <ClientOnly><img v-if="chainIcon" :src="chainIcon" class="w-4 h-4 shrink-0" :alt="drop.chain"></ClientOnly>
                <div class="capitalize text-foreground">
                  {{ chainSpec[drop.chain].tokenSymbol }}
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Action section with mobile-friendly button -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-1 sm:justify-between sm:items-center">
          <div class="hidden sm:block text-muted-foreground text-left text-sm sm:text-base">
            {{ drop?.start_at ? formatToNow(parseCETDate(drop.start_at || '')) : 'N/A' }}
          </div>
          <DropMintButton
            class="w-full sm:w-fit"
            :drop="drop"
            size="sm"
          />
        </div>
      </div>
    </div>
  </div>
</template>
