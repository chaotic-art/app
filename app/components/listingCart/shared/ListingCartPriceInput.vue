<script setup lang="ts">
const { chainSymbol } = useChain()

const price = defineModel<number | string>({ required: true, default: '' })
</script>

<template>
  <div class="relative">
    <UInput
      v-model="price"
      type="number"
      step="0.001"
      min="0"
      placeholder="Price"
      size="xl"
      class="w-full text-lg"
    />
    <div class="absolute right-10 top-1/2 transform -translate-y-1/2">
      <span class="text-gray-500 dark:text-gray-400 font-medium">
        {{ chainSymbol }}
      </span>
    </div>
  </div>
</template>
