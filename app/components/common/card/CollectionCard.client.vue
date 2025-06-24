<script setup lang="ts">
import { sanitizeIpfsUrl } from '~/utils/ipfs'

interface Collection {
  id: string | number
  name: string
  image?: string
  issuer?: string
}

interface Props {
  item: Collection
  prefix?: string
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  prefix: '',
  isLoading: false,
})
</script>

<template>
  <NuxtLink
    class="border rounded-xl border-gray-300 overflow-hidden bg-white hover:shadow-lg transition-shadow"
    :to="`/${prefix}/collection/${item.id}`"
  >
    <!-- Collection Image -->
    <div class="aspect-square bg-gray-200 overflow-hidden">
      <img
        v-if="item.image && !isLoading"
        :src="sanitizeIpfsUrl(item.image)"
        :alt="item.name"
        class="w-full h-full object-cover"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      >
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
        :class="{ 'animate-pulse': isLoading }"
      >
        <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
      </div>
    </div>

    <!-- Card Content -->
    <div class="p-4 space-y-3">
      <!-- Collection Title -->
      <div v-if="!isLoading" class="font-medium text-gray-900 truncate">
        {{ item.name }}
      </div>
      <div v-else class="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />

      <!-- Collection Owner Info -->
      <div v-if="!isLoading && item.issuer" class="text-sm text-gray-600 truncate">
        By {{ item.issuer.slice(0, 6) }}...{{ item.issuer.slice(-4) }}
      </div>
      <div v-else-if="isLoading" class="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
    </div>
  </NuxtLink>
</template>
