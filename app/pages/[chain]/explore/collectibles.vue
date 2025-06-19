<script setup lang="ts">
import { CHAINS } from '@kodadot1/static'

// Validate chain parameter
definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && chain in CHAINS
  },
})

// State for UI controls
const selectedCategory = ref('Gen Art')
const selectedType = ref('Collections')
const isListedFilter = ref(false)
const sortBy = ref('Recent')
const viewMode = ref('Grid')

// Categories for browsing
const categories = ['Gen Art', 'PFPs', 'Art']
const typeOptions = ['Collections', 'NFTs']
const sortOptions = ['Recent', 'Price: Low to High', 'Price: High to Low', 'Most Popular']
const viewOptions = ['Grid', 'List']

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
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <div class="space-y-8">
      <!-- Header -->
      <div class="space-y-6">
        <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold font-serif italic text-center md:text-left">
          Gallery
        </h1>

        <!-- Browse Categories -->
        <div class="space-y-4">
          <div class="text-lg font-medium text-gray-700">
            Browse:
          </div>
          <div class="flex flex-wrap gap-3">
            <UButton
              v-for="category in categories"
              :key="category"
              :variant="selectedCategory === category ? 'solid' : 'outline'"
              :color="selectedCategory === category ? 'primary' : 'neutral'"
              class="rounded-full px-6 py-2"
              @click="selectedCategory = category"
            >
              {{ category }}
            </UButton>
          </div>
        </div>
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

        <!-- Right Side - Filters -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Listed For Sale Toggle -->
          <UButton
            :variant="isListedFilter ? 'solid' : 'outline'"
            :color="isListedFilter ? 'primary' : 'neutral'"
            class="rounded-full px-4 py-2 text-sm"
            @click="isListedFilter = !isListedFilter"
          >
            Listed For Sale
          </UButton>

          <!-- Sort By Dropdown -->
          <USelectMenu
            v-model="sortBy"
            :options="sortOptions"
            placeholder="Sort By"
            class="w-40"
          />

          <!-- View Mode Dropdown -->
          <USelectMenu
            v-model="viewMode"
            :options="viewOptions"
            placeholder="View"
            class="w-24"
          />
        </div>
      </div>

      <!-- Grid Content -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <div
          v-for="item in placeholderItems"
          :key="item.id"
          class="border rounded-xl border-gray-300 overflow-hidden bg-white hover:shadow-lg transition-shadow"
        >
          <!-- Placeholder Image -->
          <div class="aspect-square bg-gray-200 flex items-center justify-center">
            <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
          </div>

          <!-- Card Content -->
          <div class="p-4 space-y-3">
            <!-- Placeholder Title -->
            <div class="h-4 bg-gray-200 rounded w-3/4" />

            <!-- Placeholder Subtitle -->
            <div class="h-3 bg-gray-100 rounded w-1/2" />

            <!-- Placeholder Price -->
            <div class="h-3 bg-gray-100 rounded w-1/3" />

            <!-- View Button -->
            <div class="pt-2">
              <UButton
                variant="outline"
                color="neutral"
                size="sm"
                class="rounded-full w-full"
              >
                View
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State (can be shown when no results) -->
      <div v-if="false" class="text-center py-16">
        <div class="text-gray-400 mb-4">
          <UIcon name="i-heroicons-photo" class="w-16 h-16 mx-auto" />
        </div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">
          No items found
        </h3>
        <p class="text-gray-500">
          Try adjusting your filters to see more results.
        </p>
      </div>
    </div>
  </UContainer>
</template>
