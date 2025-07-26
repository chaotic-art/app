<script setup lang="ts">
import type { OdaToken } from '~/services/oda'

interface Props {
  tokenData?: OdaToken
  chain: string
}

defineProps<Props>()
</script>

<template>
  <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-3 md:p-4 bg-white dark:bg-neutral-900">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
      Token Information
    </h3>
    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Chain</span>
        <span class="text-sm font-semibold text-gray-900 dark:text-white capitalize">{{ chain }}</span>
      </div>

      <!-- Media Information -->
      <div v-if="tokenData?.metadata?.image" class="flex justify-between items-center">
        <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Media</span>
        <UButton
          :to="sanitizeIpfsUrl(tokenData.metadata.image)"
          target="_blank"
          variant="ghost"
          size="xs"
          icon="i-heroicons-arrow-top-right-on-square"
          class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
        >
          View
        </UButton>
      </div>

      <!-- Animated Media Information -->
      <div v-if="tokenData?.metadata?.animation_url" class="flex justify-between items-center">
        <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Animation</span>
        <UButton
          :to="sanitizeIpfsUrl(tokenData.metadata.animation_url)"
          target="_blank"
          variant="ghost"
          size="xs"
          icon="i-heroicons-arrow-top-right-on-square"
          class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
        >
          View
        </UButton>
      </div>

      <!-- MIME Types -->
      <div v-if="tokenData?.metadata?.mime_type" class="flex justify-between items-center">
        <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Media Type</span>
        <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ tokenData.metadata.mime_type }}</span>
      </div>

      <div v-if="tokenData?.metadata?.animation_mime_type" class="flex justify-between items-center">
        <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Animation Type</span>
        <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ tokenData.metadata.animation_mime_type }}</span>
      </div>

      <!-- Metadata URL -->
      <div v-if="tokenData?.metadata_uri" class="flex justify-between items-center">
        <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Metadata</span>
        <UButton
          :to="sanitizeIpfsUrl(tokenData.metadata_uri)"
          target="_blank"
          variant="ghost"
          size="xs"
          icon="i-heroicons-arrow-top-right-on-square"
          class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
        >
          View
        </UButton>
      </div>
    </div>
  </div>
</template>
