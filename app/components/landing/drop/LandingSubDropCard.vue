<script lang="ts" setup>
import type { DropItem } from '@/types'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

const props = defineProps<{
  drop: DropItem
}>()

const { getChainIcon } = useIcon()

const chainIcon = computed(() => getChainIcon(props.drop.chain))
</script>

<template>
  <div :key="drop.id" class="flex flex-1 rounded-xl h-[440px] overflow-hidden border border-[#EBEBEB] bg-white">
    <div class="h-full aspect-square bg-gray-200 relative rounded-xl overflow-hidden border border-[#EBEBEB]">
      <NuxtImg
        :src="sanitizeIpfsUrl(drop.banner)"
        :alt="drop?.name"
        class="w-full h-full aspect-square object-cover"
      />
    </div>
    <div class="p-6 flex flex-col justify-between">
      <div class="flex flex-col gap-4">
        <div class="font-serif italic font-medium text-[40px]">
          {{ drop.name }}
        </div>
        <div class="flex justify-between flex-wrap items-center gap-1 mb-1">
          <UserInfo :address="drop.creator" :avatar-size="30" class="h-[40px]" />
          <FollowButton
            :target="drop.creator!" class="h-[40px] px-4 py-2"
          />
        </div>
        <div class="text-gray-500 max-w-[300px] line-clamp-3">
          {{ drop.collectionDescription }}
        </div>
      </div>

      <div class="flex flex-col gap-6 mt-2">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span>{{ drop.minted }}/{{ drop.max }} {{ $t('drop.minted') }}</span>
            <span class="font-bold text-gray-400">·</span>
            <span>5 USD</span>
          </div>

          <div class="flex items-center gap-2">
            <NuxtImg v-if="chainIcon" :src="chainIcon" class="w-4 h-4" />
            <div class="capitalize">
              {{ drop.chain }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1 justify-between">
          <div class="text-gray-400">
            Ends in 30m
          </div>
          <UButton variants="primary" class="rounded-full px-5 py-2 hover:bg-gray-900">
            {{ $t('drop.mint') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
