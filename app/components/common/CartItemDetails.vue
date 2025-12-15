<script setup lang="ts">
defineProps<{
  name: string
  image?: string
  collectionName: string
  price?: number
  notEligible?: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-4">
    <!-- NFT Image -->
    <div class="w-12 h-12 bg-gray-200 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden flex-shrink-0">
      <img
        v-if="image"
        :src="sanitizeIpfsUrl(image)"
        :alt="name || 'NFT'"
        class="w-full h-full object-cover"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      >
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-neutral-700"
      >
        <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
      </div>
    </div>

    <!-- NFT Details -->
    <div class="flex flex-1 justify-between">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h2 class="flex-1 w-0 font-bold text-gray-900 dark:text-white truncate">
            {{ name || '--' }}
          </h2>
          <div
            v-if="notEligible"
            class="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full flex-shrink-0"
            title="This token is not eligible for burning"
          >
            <UIcon name="i-heroicons-exclamation-triangle" class="w-3 h-3" />
            <span>Not Eligible</span>
          </div>
        </div>
        <p class="text-gray-600 dark:text-gray-400 truncate">
          {{ collectionName }}
        </p>
      </div>

      <slot name="right">
        <Money v-if="price" :value="price" inline class="mt-auto" />
      </slot>
    </div>
  </div>
</template>
