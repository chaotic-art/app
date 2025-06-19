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
const selectedType = ref('Collections')

// Categories for browsing
const typeOptions = ['Collections', 'NFTs']
const sortOptions = [
  { label: 'Recent', value: 'blockNumber_DESC' },
  { label: 'Oldest', value: 'blockNumber_ASC' },
  { label: 'A-Z', value: 'name_ASC' },
  { label: 'Z-A', value: 'name_DESC' },
]

// SEO Meta
useSeoMeta({
  title: 'Gallery - Explore Collections and NFTs',
  description: 'Browse and discover collections and NFTs across different categories.',
})

const { prefix } = usePrefix()
const route = useRoute()
const router = useRouter()

// Initialize selectedSort from URL query params
function initSortFromQuery() {
  const sortParam = route.query.sort as string
  if (sortParam) {
    const sortOption = sortOptions.find(option => option.value === sortParam)
    if (sortOption) {
      return sortOption
    }
  }
  // Default to Recent if no valid sort in URL
  return { label: 'Recent', value: 'blockNumber_DESC' }
}

const selectedSort = ref(initSortFromQuery())

// Watch selectedSort and update URL
watch(selectedSort, (newSort) => {
  const query = { ...route.query }
  if (newSort.value === 'blockNumber_DESC') {
    // Remove sort param for default value to keep URL clean
    delete query.sort
  }
  else {
    query.sort = newSort.value
  }

  router.push({ query })
}, { deep: true })

// Watch route query changes (for browser back/forward)
watch(() => route.query.sort, () => {
  const newSort = initSortFromQuery()
  if (newSort.value !== selectedSort.value.value) {
    selectedSort.value = newSort
  }
})

// Computed variables for the query
const queryVariables = computed(() => ({
  orderBy: selectedSort.value.value,
}))
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

        <!-- Right Side - Sort Options -->
        <div class="flex items-center gap-3">
          <USelectMenu
            v-model="selectedSort"
            :items="sortOptions"
            placeholder="Sort By"
            class="w-32"
          />
        </div>
      </div>

      <!-- Grid Content -->
      <CollectionsGrid
        :key="selectedSort.value"
        :variables="queryVariables"
        :prefix="prefix"
        :page-size="40"
        :distance="300"
      />
    </div>
  </UContainer>
</template>
