<script setup lang="ts">
import { CHAINS } from '@kodadot1/static'
import { exploreCollections, type ExploreCollectionsData } from '~/graphql/queries/explore'
import { getDenyList } from '~/utils/prefix'

// Validate chain parameter
definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && chain in CHAINS
  },
})

// State for UI controls
const selectedType = ref('Collections')

// Data loading state
const isLoading = ref(true)

// Categories for browsing
const typeOptions = ['Collections', 'NFTs']

// Mock data for placeholder cards
const placeholderItems = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  image: '',
}))

// SEO Meta
useSeoMeta({
  title: 'Gallery - Explore Collections and NFTs',
  description: 'Browse and discover collections and NFTs across different categories.',
})

const { $apolloClient } = useNuxtApp()
const { prefix } = usePrefix()

const topCollectionsData = ref<ExploreCollectionsData | null>(null)

// Computed property to get collections array
const collections = computed(() => {
  return topCollectionsData.value?.collectionEntities || []
})

// Computed property to determine if we should show placeholder or real data
const displayItems = computed(() => {
  if (isLoading.value || !topCollectionsData.value) {
    return placeholderItems.map(item => ({ ...item, isPlaceholder: true }))
  }
  return collections.value.map((collection, index) => ({
    id: collection.id,
    name: collection.name || `Collection ${index + 1}`,
    image: collection.meta?.image || '',
    issuer: collection.issuer,
    currentOwner: collection.currentOwner,
    metadata: collection.metadata,
    isPlaceholder: false,
  }))
})

onMounted(async () => {
  try {
    const { data } = await $apolloClient.query({
      query: exploreCollections,
      variables: {
        first: 40,
        offset: 0,
        denyList: getDenyList(prefix.value) || [],
        search: [],
      },
    })

    topCollectionsData.value = data
  }
  catch (error) {
    console.error('Error fetching collections:', error)
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <div class="space-y-8">
      <!-- Header -->
      <div class="space-y-6">
        <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold font-serif italic text-center md:text-left">
          Explore
        </h1>
      </div>

      <!-- Controls Row -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <!-- Left Side - Type Toggle -->
        <div class="flex bg-gray-100 rounded-full p-1">
          <UButton
            v-for="type in typeOptions"
            :key="type"
            :variant="selectedType === type ? 'solid' : 'ghost'"
            class="rounded-full px-4 py-2 text-sm font-medium"
            @click="selectedType = type"
          >
            {{ type }}
          </UButton>
        </div>
      </div>

      <!-- Grid Content -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <NuxtLink
          v-for="item in displayItems"
          :key="item.id"
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
            <div v-if="!isLoading && 'issuer' in item" class="text-sm text-gray-600 truncate">
              By {{ item.issuer?.slice(0, 6) }}...{{ item.issuer?.slice(-4) }}
            </div>
            <div v-else-if="isLoading" class="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />

            <!-- Placeholder for stats/price -->
            <!-- <div v-if="!isLoading" class="text-sm text-gray-500">
              Collection
            </div>
            <div v-else class="h-3 bg-gray-100 rounded w-1/3 animate-pulse" /> -->
          </div>
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="text-gray-500">
          Loading collections...
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="collections.length === 0" class="text-center py-16">
        <div class="text-gray-400 mb-4">
          <UIcon name="i-heroicons-photo" class="w-16 h-16 mx-auto" />
        </div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">
          No collections found
        </h3>
        <p class="text-gray-500">
          Try adjusting your filters to see more results.
        </p>
      </div>
    </div>
  </UContainer>
</template>
