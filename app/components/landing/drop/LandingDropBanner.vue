<script setup lang="ts">
import { getDrops } from '@/services/fxart'
import { useQuery } from '@tanstack/vue-query'

const { getChainIcon } = useIcon()

const { data: dropItems } = useQuery({
  queryKey: ['landing-drop-items', 'ahp'],
  queryFn: () => getDrops({
    active: [true],
    chain: ['ahp'],
    limit: 3,
  }),
})

const mainDrop = computed(() => dropItems.value?.[0])
const subDrops = computed(() => dropItems.value?.slice(1, 3))
</script>

<template>
  <div class="flex flex-col mb-[75px]">
    <DropCardAttributeEnhance v-if="mainDrop" :drop="mainDrop">
      <template #default="{ drop }">
        <LandingHorizontalDropCard :drop="drop" />
      </template>
    </DropCardAttributeEnhance>

    <div class="flex flex-col md:flex-row gap-6 mt-8">
      <div v-for="subDrop in subDrops" :key="subDrop.id" class="flex flex-1 rounded-xl h-[440px] overflow-hidden border border-[#EBEBEB] bg-white">
        <div class="h-full aspect-square bg-gray-200 relative rounded-xl overflow-hidden border border-[#EBEBEB]">
          <!-- <img
            src=""
            alt="Drop Image"
            class="w-full h-full object-cover"
          > -->
        </div>
        <div class="p-6 flex flex-col justify-between">
          <div class="flex flex-col gap-4">
            <div class="font-serif italic font-medium text-[40px]">
              Crystals
            </div>
            <div class="flex justify-between flex-wrap items-center gap-1 mb-1">
              <UserInfo :avatar-size="30" class="h-[40px]" />
              <button class="h-[40px] px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100">
                + Follow
              </button>
            </div>
            <div class="text-gray-500 max-w-[300px]">
              Some Subheading Text About The Drop, Something Interesting, Maybe About The Process Of Making The Drop.
            </div>
          </div>

          <div class="flex flex-col gap-6 mt-2">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <span>10/32 Minted</span>
                <span class="font-bold text-gray-400">·</span>
                <span>$20 USD</span>
              </div>

              <div class="flex items-center gap-2">
                <NuxtImg :src="getChainIcon('base')!" class="w-4 h-4" />
                <div>Base</div>
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
    </div>
  </div>
</template>
