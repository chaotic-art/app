<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { getDrops } from '@/services/fxart'

// TODO: need to be updated or fetch artists from backend

const { data: dropItems } = useQuery({
  queryKey: ['landing-drop-artists', 'ahp'],
  queryFn: () => getDrops({
    active: [true],
    chain: ['ahp'],
    limit: 50,
  }),
})

const allArtists = computed(() => [...new Set(dropItems.value?.map(drop => drop.creator).filter(Boolean))])
const randomSixArtist = computed(() => allArtists.value?.slice().sort(() => Math.random() - 0.5).slice(0, 6))
</script>

<template>
  <section class="py-8 md:py-16 bg-gray-50 dark:bg-neutral-900">
    <UContainer>
      <div class="text-2xl md:text-[50px] font-serif italic font-medium mb-4 md:mb-8 px-4 text-center md:text-left text-gray-900 dark:text-white">
        {{ $t('artist.curated') }} <span class="text-gray-400 dark:text-gray-500">&lt;</span>{{ $t('artist.all') }}<span class="text-gray-400 dark:text-gray-500">&gt;</span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
        <div
          v-for="artist in randomSixArtist"
          :key="artist"
          class="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 md:px-6 md:py-4 border border-gray-200 dark:border-neutral-700"
        >
          <UserInfo :address="artist" :avatar-size="56" :custom-name="true" :transparent-background="true" class="md:hidden">
            <template #name="{ addressName }">
              <span class="text-lg font-serif italic font-medium ml-3 text-gray-900 dark:text-white">
                {{ addressName }}
              </span>
            </template>
          </UserInfo>
          <UserInfo :address="artist" :avatar-size="72" :custom-name="true" :transparent-background="true" class="hidden md:flex">
            <template #name="{ addressName }">
              <span class="text-[32px] font-serif italic font-medium ml-4 text-gray-900 dark:text-white">
                {{ addressName }}
              </span>
            </template>
          </UserInfo>
          <FollowButton :target="artist!" class="text-sm md:text-base" />
        </div>
      </div>
    </UContainer>
  </section>
</template>
