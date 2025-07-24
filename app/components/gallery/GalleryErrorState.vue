<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
    <div class="order-2 lg:order-1">
      <div class="relative border border-red-200 dark:border-red-800 rounded-2xl overflow-hidden bg-red-50 dark:bg-red-900/20 p-4">
        <div class="aspect-square bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-400" />
        </div>
      </div>
    </div>
    <div class="order-1 lg:order-2">
      <div class="text-center lg:text-left">
        <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
          Failed to Load NFT
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          There was an error loading this NFT. Please try again later.
        </p>
        <UButton variant="outline" class="rounded-full" @click="$router.go(-1)">
          Go Back
        </UButton>
      </div>
    </div>
  </div>
</template>
