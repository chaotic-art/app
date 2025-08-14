<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { sanitizeIpfsUrl } from '~/utils/ipfs'

interface Props {
  item: ReturnType<typeof useInfiniteCollections>['collections']['value'][number]
  prefix?: Prefix
  isLoading?: boolean
  volume?: string
}

const props = withDefaults(defineProps<Props>(), {
  prefix: 'ahp',
  isLoading: false,
  volume: '',
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
    class="group relative bg-background rounded-xl shadow-xs hover:shadow-sm border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1"
    :class="{ 'animate-pulse': isLoading }"
  >
    <NuxtLink
      :to="`/${prefix}/collection/${item.id}`"
      class="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
    >
      <!-- Hero Banner Section -->
      <div class="relative h-48 bg-gradient-to-br from-gray-100 dark:from-neutral-800 to-gray-200 dark:to-neutral-900 overflow-hidden">
        <!-- Banner Background Image -->
        <div class="absolute inset-0">
          <img
            v-if="item.image && !isLoading"
            :src="sanitizeIpfsUrl(item.image)"
            :alt="`${item.name} collection banner`"
            class="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          >
          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <!-- Collection Thumbnail & Title Overlay -->
        <div class="absolute inset-0 p-4 flex flex-col justify-end">
          <div class="flex items-end space-x-4">
            <!-- Collection Thumbnail -->
            <div class="flex-shrink-0 w-16 h-16 rounded-xl bg-white dark:bg-neutral-800 shadow-lg p-1 border-2 border-white/20">
              <img
                v-if="item.image && !isLoading"
                :src="sanitizeIpfsUrl(item.image)"
                :alt="`${item.name} collection`"
                class="w-full h-full rounded-lg object-cover"
                loading="lazy"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              >
              <div
                v-else
                class="w-full h-full rounded-lg bg-gradient-to-br from-gray-100 dark:from-neutral-700 to-gray-200 dark:to-neutral-800 flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-photo"
                  class="w-6 h-6 text-gray-400"
                  :class="{ 'animate-pulse': isLoading }"
                />
              </div>
            </div>

            <!-- Collection Title -->
            <div class="flex-1 min-w-0 pb-1">
              <h3 v-if="!isLoading" class="font-bold text-lg text-white leading-tight truncate drop-shadow-lg">
                {{ item.name }}
              </h3>
              <div v-else class="h-6 bg-white/20 rounded w-3/4 animate-pulse" />

              <p v-if="!isLoading" class="text-sm text-white/80 mt-1 truncate">
                Collection #{{ item.id }}
              </p>
              <div v-else class="h-4 bg-white/20 rounded w-1/2 mt-1 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="p-4 bg-gray-50/50 dark:bg-neutral-800/50">
        <!-- Loading State -->
        <div v-if="isLoadingData" class="grid grid-cols-3 gap-4">
          <div v-for="i in 3" :key="i" class="text-center">
            <div class="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-full mb-2 animate-pulse" />
            <div class="h-5 bg-gray-300 dark:bg-neutral-600 rounded w-3/4 mx-auto animate-pulse" />
          </div>
        </div>

        <!-- Stats Data -->
        <div v-else class="grid grid-cols-3 gap-4">
          <!-- Volume or Items -->
          <div class="text-center">
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {{ volume ? 'Volume' : 'Items' }}
            </div>
            <div class="text-sm font-bold text-gray-900 dark:text-white">
              <Money v-if="volume" :value="volume" :round="0" inline />
              <span v-else>{{ collectionData.items || '0' }}</span>
            </div>
          </div>

          <!-- Floor Price -->
          <div class="text-center">
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Floor
            </div>
            <div class="text-sm font-bold text-gray-900 dark:text-white">
              <Money v-if="collectionData.floor" :value="collectionData.floor" :round="2" inline />
              <span v-else class="text-gray-400 dark:text-gray-500">–</span>
            </div>
          </div>

          <!-- Owners -->
          <div class="text-center">
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Owners
            </div>
            <div class="text-sm font-bold text-gray-900 dark:text-white">
              {{ collectionData.uniqueOwners || '–' }}
            </div>
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
