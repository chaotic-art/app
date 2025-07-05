<script lang="ts" setup>
import type { DropItem } from '@/types'
import { parseCETDate } from '@/components/drops/utils'
import { formatToNow } from '@/utils/format/time'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

const props = defineProps<{
  drop?: DropItem
  description?: string
  claimed?: number
}>()
const emit = defineEmits(['click'])

const { getChainIcon } = useIcon()

const chainIcon = computed(() => getChainIcon(props.drop?.chain || null))
const { decimals, chainSymbol } = useChain()
const { usd: usdPrice } = useAmount(computed(() => props.drop?.price), decimals, chainSymbol)
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 rounded-xl h-auto md:h-[440px] overflow-hidden border border-[#EBEBEB] bg-white" @click="emit('click', drop)">
    <div class="h-full bg-gray-200 relative rounded-xl overflow-hidden border border-[#EBEBEB]">
      <img
        :src="sanitizeIpfsUrl(drop?.banner)"
        :alt="drop?.name"
        class="w-full h-full object-cover"
      >
    </div>
    <div class="p-4 md:p-6 flex flex-col justify-between flex-1">
      <div class="flex flex-col gap-3 md:gap-4">
        <div class="font-serif italic line-clamp-1 font-medium text-xl md:text-[40px] text-center md:text-left">
          {{ drop?.name }}
        </div>
        <div class="flex flex-row justify-between flex-wrap items-center gap-2 md:gap-1 mb-1">
          <UserInfo :address="drop?.creator" :avatar-size="30" class="h-[40px]" />
          <FollowButton
            :target="drop?.creator!" class="h-[40px] px-4 py-2"
          />
        </div>
        <div class="text-gray-500 max-w-full md:max-w-[300px] line-clamp-3 md:line-clamp-4">
          <MarkdownPreview :source="description || ''" />
        </div>
      </div>

      <div class="flex flex-col gap-4 md:gap-6 mt-4 md:mt-2">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
          <div class="flex items-center gap-2 justify-center md:justify-start">
            <span>{{ claimed }}/{{ drop?.max }} {{ $t('drop.minted') }}</span>
            <span class="font-bold text-gray-400">·</span>
            <span>{{ usdPrice }} USD</span>
          </div>

          <div class="flex items-center gap-2 justify-center md:justify-end">
            <img v-if="chainIcon" :src="chainIcon" class="w-4 h-4" :alt="drop?.chain">
            <div class="capitalize">
              {{ drop?.chain }}
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center md:flex-row gap-3 md:gap-1 md:justify-between">
          <div class="text-gray-400 text-center md:text-left">
            {{ formatToNow(parseCETDate(drop?.start_at || '')) }}
          </div>
          <LandingDropMintButton :drop="drop" :is-minted-out="claimed === drop?.max" />
        </div>
      </div>
    </div>
  </div>
</template>
