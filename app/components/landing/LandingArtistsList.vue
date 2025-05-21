<script setup lang="ts">
interface Artist {
  id: string
  name: string
  avatar?: string
}

const artists: Artist[] = [
  {
    id: '1',
    name: 'AAA AA',
  },
  {
    id: '2',
    name: 'BBB BB',
  },
  {
    id: '3',
    name: 'CCC CC',
  },
  {
    id: '4',
    name: 'DDD DD',
  },
  {
    id: '5',
    name: 'EEE EE',
  },
  {
    id: '6',
    name: 'FFF FF',
  },
]
</script>

<template>
  <section class="py-16 bg-[#fafafa]">
    <UContainer>
      <div class="text-[50px] font-serif italic font-medium mb-8">
        Curated <span class="text-gray-400">&lt;</span>Artists<span class="text-gray-400">&gt;</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="artist in artists"
          :key="artist.id"
          class="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-[#EBEBEB]"
        >
          <div class="flex items-center gap-4">
            <ProfileAvatar :size="72" />

            <span class="text-[32px] font-serif italic font-medium">
              {{ artist.name }}
            </span>
          </div>

          <UButton
            class="ml-4 px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-100"
          >
            + Follow
          </UButton>
        </div>
      </div>
    </UContainer>
  </section>
</template>
