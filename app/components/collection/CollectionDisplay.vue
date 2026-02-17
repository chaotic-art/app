<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'

const props = defineProps<{
  name: string
  description: string
  image: string
  banner: string
  owner: string
  supply: string
  claimed: string
  floor: number | null
  chain: AssetHubChain
  collectionId: string
  readOnly?: boolean
}>()

const bannerUrl = computed(() => {
  return props.banner ? toOriginalContentUrl(sanitizeIpfsUrl(props.banner)) : ''
})
</script>

<template>
  <div>
    <!-- Banner Section -->
    <div class="relative w-full min-h-[340px] flex flex-col justify-end rounded-xl overflow-hidden">
      <div
        class="absolute inset-0 w-full h-full bg-muted"
        :style="bannerUrl ? {
          backgroundImage: `url('${bannerUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}"
      />

      <div class="relative flex items-center px-8 py-8 z-10">
        <div class="flex flex-col items-center">
          <div class="w-36 h-36 rounded-xl overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-4 border-white dark:border-gray-900 shadow-xl">
            <img
              v-if="image"
              :src="sanitizeIpfsUrl(image)"
              :alt="name"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-heroicons-photo" class="w-12 h-12 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full">
      <div class="flex justify-between flex-col md:flex-row gap-12">
        <div class="flex flex-col flex-1">
          <div class="my-4">
            <div class="text-2xl font-bold mb-2">
              {{ name }}
            </div>
            <div v-if="owner" class="flex items-center gap-1 text-muted-foreground">
              <UserInfo :avatar-size="26" :address="owner" class="min-w-0" />
            </div>
          </div>
          <MarkdownPreview v-if="description" :source="description" />
        </div>

        <!-- Quick Stats -->
        <div class="pt-4 w-auto md:w-60 space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500 dark:text-gray-400">Minted</span>
            <span class="font-medium font-mono text-gray-900 dark:text-white">{{ claimed || 0 }} / {{ Number(supply) >= Number.MAX_SAFE_INTEGER ? '∞' : (supply || 0) }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500 dark:text-gray-400">Floor Price</span>
            <span class="font-medium text-gray-900 dark:text-white">
              <Money v-if="floor" inline :value="floor" />
              <span v-else class="text-gray-400 dark:text-gray-500">--</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- NFT grid omitted: no items to display in read-only preview -->
  </div>
</template>
