<script lang="ts" setup>
</script>

<template>
  <section class="py-8 md:py-16 px-4 md:px-0 bg-background-color">
    <div class="text-2xl md:text-[50px] font-serif italic font-medium mb-4 md:mb-8 text-center md:text-left text-gray-900 dark:text-white">
      Articles
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      <div v-for="i in 3" :key="i" class="flex flex-col hover-card-effect rounded-lg overflow-hidden">
        <div class="bg-gray-200 dark:bg-neutral-800 h-[120px] md:h-[150px]" />
        <div class="bg-gray-100 dark:bg-neutral-700 h-[80px] md:h-[100px]" />
      </div>
    </div>
  </section>
</template>
