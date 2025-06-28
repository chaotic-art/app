<script setup lang="ts">
defineProps<{
  extension: WalletExtension
}>()
</script>

<template>
  <div class="flex flex-col items-center space-y-3">
    <div class="relative">
      <img
        v-if="extension.icon"
        :src="extension.icon"
        :alt="`${extension.name} logo`"
        class="w-6 h-6 object-contain"
      >
      <div v-if="extension.vm === 'EVM'" class="absolute -right-2 -bottom-2 w-4 h-4 rounded-full bg-secondary-100 dark:bg-secondary-900/20 flex items-center justify-center">
        <UIcon name="i-simple-icons-ethereum" class="w-3 h-3 text-secondary-600 absolute right-0 bottom-0" />
      </div>
    </div>

    <div class="flex flex-col space-y-0.5 justify-center">
      <div class="font-medium text-sm text-gray-900 dark:text-gray-100">
        {{ extension.name }}
      </div>

      <slot />
    </div>
  </div>
</template>
