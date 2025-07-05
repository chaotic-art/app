<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { sanitizeIpfsUrl } from '~/utils/ipfs'

interface Props {
  item: ReturnType<typeof useInfiniteCollections>['collections']['value'][number]
  prefix?: Prefix
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  prefix: 'ahp',
  isLoading: false,
})

const { $api } = useNuxtApp()

const collectionData = reactive({
  items: 0,
  floor: 0,
  uniqueOwners: 0,
})

const isLoadingData = ref(false)

// temporary: fetch onchain data
onMounted(async () => {
  if (props.isLoading)
    return

  isLoadingData.value = true
  try {
    const api = await $api(props.prefix)

    const [queryItems, queryFloor] = await Promise.all([
      api.query.Nfts.Item.getEntries(Number(props.item.id)),
      api.query.Nfts.ItemPriceOf.getEntries(Number(props.item.id)),
    ])

    collectionData.items = queryItems.length

    if (queryFloor.length) {
      const floorValues = queryFloor
        .filter(item => Number(item.value[0]) > 0)
        .map(item => Number(item.value[0]))
      collectionData.floor = Math.min(...floorValues)
    }

    if (queryItems.length) {
      const uniqueOwners = new Set(queryItems.map(item => item.value.owner))
      collectionData.uniqueOwners = uniqueOwners.size
    }
  }
  finally {
    isLoadingData.value = false
  }
})
</script>

<template>
  <article
    class="group relative bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200/60 dark:border-neutral-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/10 hover:-translate-y-1 hover:border-gray-300/80 dark:hover:border-neutral-500/80"
    :class="{ 'animate-pulse': isLoading }"
  >
    <NuxtLink
      :to="`/${prefix}/collection/${item.id}`"
      class="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl"
    >
      <!-- Collection Image Container -->
      <div class="relative aspect-square bg-gradient-to-br from-gray-50 dark:from-neutral-800 to-gray-100 dark:to-neutral-900 overflow-hidden">
        <!-- Main Image -->
        <img
          v-if="item.image && !isLoading"
          :src="sanitizeIpfsUrl(item.image)"
          :alt="`${item.name} collection`"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        >

        <!-- Image Placeholder -->
        <div
          v-else
          class="absolute inset-0 flex items-center justify-center"
          :class="{ 'bg-gray-100 dark:bg-neutral-800': isLoading, 'bg-gradient-to-br from-gray-100 dark:from-neutral-800 to-gray-200 dark:to-neutral-900': !isLoading }"
        >
          <div class="text-center">
            <UIcon
              name="i-heroicons-photo"
              class="w-12 h-12 text-gray-400 mb-2 mx-auto"
              :class="{ 'animate-pulse': isLoading }"
            />
            <p v-if="!isLoading" class="text-xs text-gray-500 dark:text-gray-400">
              No Image
            </p>
          </div>
        </div>

        <!-- Gradient Overlay on Hover -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <!-- Collection ID Badge -->
        <div v-if="!isLoading" class="absolute top-3 right-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          #{{ item.id }}
        </div>

        <!-- Collection Owner - Overlay on Image -->
        <div v-if="!isLoading && item.issuer" class="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <UserInfo
            :address="item.issuer"
            :avatar-size="28"
          />
        </div>
      </div>

      <!-- Card Content -->
      <div class="p-5 space-y-4">
        <!-- Header Section -->
        <div class="space-y-2">
          <!-- Collection Title -->
          <h3 v-if="!isLoading" class="font-semibold text-lg text-gray-900 dark:text-white leading-tight truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {{ item.name }}
          </h3>
          <div v-else class="h-6 bg-gray-200 dark:bg-neutral-800 rounded-lg w-4/5 animate-pulse" />
        </div>

        <!-- Collection Stats -->
        <div v-if="!isLoading" class="bg-gray-50/50 dark:bg-neutral-800/50 rounded-xl p-3 border border-gray-100 dark:border-neutral-700">
          <!-- Loading Indicator -->
          <div v-if="isLoadingData" class="flex items-center justify-center py-2">
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin text-gray-400 mr-2" />
            <span class="text-xs text-gray-500 dark:text-gray-400">Loading stats...</span>
          </div>

          <!-- Stats Data -->
          <div v-else class="grid grid-cols-3 gap-3">
            <!-- Items Count -->
            <div class="text-center">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Items
              </div>
              <div class="text-base font-semibold text-gray-900 dark:text-white">
                {{ collectionData.items || '–' }}
              </div>
            </div>

            <!-- Floor Price -->
            <div class="text-center border-x border-gray-200 dark:border-neutral-700">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Floor
              </div>
              <div class="text-base font-semibold text-gray-900 dark:text-white">
                <Money v-if="collectionData.floor" inline :value="collectionData.floor" />
                <span v-else class="text-gray-400 dark:text-gray-500">–</span>
              </div>
            </div>

            <!-- Unique Owners -->
            <div class="text-center">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Owners
              </div>
              <div class="text-base font-semibold text-gray-900 dark:text-white">
                {{ collectionData.uniqueOwners || '–' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State for Stats -->
        <div v-else-if="isLoading" class="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3">
          <div class="grid grid-cols-3 gap-3">
            <div v-for="i in 3" :key="i" class="text-center">
              <div class="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-full mb-2 animate-pulse" />
              <div class="h-5 bg-gray-300 dark:bg-neutral-700 rounded w-3/4 mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
