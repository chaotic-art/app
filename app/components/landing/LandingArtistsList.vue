<script setup lang="ts">
import { getDrops } from '@/services/fxart'
import { useQuery } from '@tanstack/vue-query'

// TODO: need to be updated or fetch artists from backend

const { data: dropItems } = useQuery({
  queryKey: ['landing-drop-artists', 'ahp'],
  queryFn: () => getDrops({
    active: [true],
    chain: ['ahp'],
    limit: 50,
  }),
})

const artists = computed(() => dropItems.value?.map(drop => drop.creator).filter(Boolean))

const randomSixArtist = computed(() => artists.value?.slice().sort(() => Math.random() - 0.5).slice(0, 6))
</script>

<template>
  <section class="py-16 bg-[#fafafa]">
    <UContainer>
      <div class="text-[50px] font-serif italic font-medium mb-8">
        {{ $t('artist.curated') }} <span class="text-gray-400">&lt;</span>{{ $t('artist.all') }}<span class="text-gray-400">&gt;</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="artist in randomSixArtist"
          :key="artist"
          class="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-[#EBEBEB]"
        >
          <UserInfo :address="artist" :avatar-size="72" :custom-name="true">
            <template #name="{ addressName }">
              <span class="text-[32px] font-serif italic font-medium ml-4">
                {{ addressName }}
              </span>
            </template>
          </UserInfo>

          <UButton
            class="ml-4 px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-100"
          >
            + {{ $t('artist.follow') }}
          </UButton>
        </div>
      </div>
    </UContainer>
  </section>
</template>
