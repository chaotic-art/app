<script setup lang="ts">
const collections = Array.from({ length: 8 }).fill({})
</script>

<template>
  <section class="pt-8 md:pt-16 px-4 md:px-0">
    <div class="text-2xl md:text-[50px] font-serif italic font-medium mb-4 md:mb-8 text-center md:text-left">
      {{ $t('collection.topCollections') }}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <div
        v-for="(_, i) in collections"
        :key="i"
        class="rounded-[15px] bg-[#D9D9D9] w-full h-[350px] md:h-[490px] flex flex-col justify-end relative overflow-hidden shadow-sm"
      >
        <div class="absolute left-0 bottom-0 w-full h-[120px] md:h-[167px] bg-[#EEEEEE] rounded-b-[15px] flex flex-col justify-end">
          <div class="flex justify-end pr-4 pb-4 md:pr-6 md:pb-6" />
        </div>
      </div>
    </div>
    <div class="flex justify-center mt-6 md:mt-8">
      <UButton class="bg-white text-black border border-[#D9D9D9] rounded-full px-6 py-2 md:px-8">
        {{ $t('collection.viewMore') }}
      </UButton>
    </div>
  </section>
</template>
