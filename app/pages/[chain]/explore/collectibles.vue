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

const queryState = computed({
  get: () => ({
    sort: sortOptions.find(opt => opt.value === route.query.sort) || sortOptions[0],
    search: route.query.search as string || '',
  }),
  set: ({ sort, search }: any) => {
    const query: any = { ...route.query }

    // Clean up default values
    if (sort?.value === 'blockNumber_DESC')
      delete query.sort
    else if (sort)
      query.sort = sort.value

    if (!search)
      delete query.search
    else query.search = search

    router.push({ query })
  },
})

const queryVariables = computed(() => ({
  orderBy: queryState.value.sort?.value || 'blockNumber_DESC',
  search: [
    {
      name_containsInsensitive: queryState.value.search,
    },
  ],
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

        <!-- Right Side - Search and Sort Options -->
        <div class="flex items-center gap-3">
          <UInput
            :model-value="queryState.search"
            placeholder="Search collections..."
            class="w-48"
            icon="i-heroicons-magnifying-glass"
            @update:model-value="queryState = { ...queryState, search: $event }"
          />
          <USelectMenu
            :model-value="queryState.sort"
            :items="sortOptions"
            placeholder="Sort By"
            class="w-32"
            @update:model-value="queryState = { ...queryState, sort: $event }"
          />
        </div>
      </div>

      <!-- Grid Content -->
      <CollectionsGrid
        :key="queryVariables.orderBy + queryVariables.search[0]?.name_containsInsensitive"
        :variables="queryVariables"
        :prefix="prefix"
        :page-size="40"
        :distance="300"
      />
    </div>
  </UContainer>
</template>
