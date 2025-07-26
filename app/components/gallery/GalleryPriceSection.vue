<script setup lang="ts">
interface Props {
  formattedPrice?: string
  usdPrice?: string
}

defineProps<Props>()
</script>

<template>
  <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-3 md:p-4 bg-white dark:bg-neutral-900">
    <div class="flex items-center justify-between mb-3 md:mb-4">
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
          Price
        </p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ formattedPrice || 'Not for sale' }}
        </p>
      </div>
      <div class="text-right">
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
          USD
        </p>
        <p class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ formattedPrice ? (usdPrice || '$0.00') : '--' }}
        </p>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-2 sm:gap-2">
      <UButton
        v-if="formattedPrice"
        class="rounded-full flex-1"
        color="primary"
        size="lg"
      >
        Buy Now
      </UButton>
      <UButton
        class="rounded-full flex-1"
        variant="outline"
        size="lg"
      >
        Make Offer
      </UButton>
    </div>
  </div>
</template>
