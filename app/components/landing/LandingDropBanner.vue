<script setup lang="ts">
const { getChainIcon } = useIcon()
const subDrops = [0, 1]
</script>

<template>
  <div class="flex flex-col mb-[75px]">
    <div class="w-full rounded-xl overflow-hidden border border-[#EBEBEB] bg-white">
      <div class="w-full h-[240px] md:h-[300px] bg-gray-200 relative">
      <!-- <img
        src=""
        alt="Drop Banner"
        class="w-full h-full object-cover"
      > -->
      </div>
      <UContainer>
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between py-6">
          <div class="flex flex-col gap-4">
            <div class="font-serif italic font-medium text-[50px]">
              Drop Name
            </div>
            <div class="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
              <UserInfo :avatar-size="40" />
              <div class="text-xs text-gray-500 max-w-[350px]">
                some subheading text about the drop, something interesting, maybe about the process of making the drop,
              </div>
            </div>
          </div>

          <div class="flex flex-col items-start md:items-end gap-6 mt-4 md:mt-0">
            <div class="text-xs  mb-1 flex items-center gap-3">
              <span class="font-medium">10/32 Minted</span>  <span class="font-bold text-gray-500">·</span>  <span class="font-medium">$20 USD</span>
            </div>
            <button class="bg-black text-white rounded-full px-4 py-[10px] text-sm hover:bg-gray-900 transition">
              {{ $t('drop.mint') }}
            </button>
          </div>
        </div>
      </UContainer>
    </div>

    <div class="flex flex-col md:flex-row gap-6 mt-8">
      <div v-for="subDrop in subDrops" :key="subDrop" class="flex flex-1 rounded-xl h-[440px] overflow-hidden border border-[#EBEBEB] bg-white">
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
