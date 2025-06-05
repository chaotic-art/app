<script lang="ts" setup>
import type { DropItem } from '@/types'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

const props = defineProps<{
  drop?: DropItem
}>()

const { decimals, chainSymbol } = useChain()
const { usd: usdPrice } = useAmount(computed(() => props.drop?.price), decimals, chainSymbol)
</script>

<template>
  <div class="w-full rounded-xl overflow-hidden border border-[#EBEBEB] bg-white">
    <img
      :src="sanitizeIpfsUrl(drop?.banner)"
      :alt="drop?.name"
      class="w-full h-[240px] md:h-[300px] bg-gray-200 relative aspect-square object-cover"
    >

    <UContainer>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between py-6">
        <div class="flex flex-col gap-4">
          <div class="font-serif italic font-medium text-[50px]">
            {{ drop?.name }}
          </div>
          <div class="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
            <UserInfo :avatar-size="40" :address="drop?.creator" />
            <div class="text-xs text-gray-500 max-w-[350px] line-clamp-3">
              <MarkdownPreview :source="drop?.collectionDescription || ''" />
            </div>
          </div>
        </div>

        <div class="flex flex-col items-start md:items-end gap-6 mt-4 md:mt-0">
          <div class="text-xs  mb-1 flex items-center gap-3">
            <span class="font-medium">{{ drop?.minted }}/{{ drop?.max }} {{ $t('drop.minted') }}</span>  <span class="font-bold text-gray-500">·</span>  <span class="font-medium">{{ usdPrice }} USD</span>
          </div>
          <button class="bg-black text-white rounded-full px-4 py-[10px] text-sm hover:bg-gray-900 transition">
            {{ $t('drop.mint') }}
          </button>
        </div>
      </div>
    </UContainer>
  </div>
</template>
