<script setup lang="ts">
const collections = Array.from({ length: 8 }).fill({})
</script>

<template>
  <section class="pt-16">
    <div class="text-[50px] font-serif italic font-medium mb-8">
      {{ $t('collection.topCollections') }}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div
        v-for="(_, i) in collections"
        :key="i"
        class="rounded-[15px] bg-[#D9D9D9] w-full h-[490px] flex flex-col justify-end relative overflow-hidden shadow-sm"
      >
        <div class="absolute left-0 bottom-0 w-full h-[167px] bg-[#EEEEEE] rounded-b-[15px] flex flex-col justify-end">
          <div class="flex justify-end pr-6 pb-6" />
        </div>
      </div>
    </div>
    <div class="flex justify-center mt-8">
      <UButton class="bg-white text-black border border-[#D9D9D9] rounded-full px-8 py-2">
        {{ $t('collection.viewMore') }}
      </UButton>
    </div>
  </section>
</template>
