<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Categories for browsing
const typeOptions = ['Collections', 'NFTs']

// Determine selected type based on current route
const selectedType = computed(() => {
  const currentPath = route.path
  if (currentPath.includes('/explore/nfts')) {
    return 'NFTs'
  }
  return 'Collections'
})

function handleTypeChange(type: string) {
  const { chain } = route.params
  if (type === 'Collections') {
    router.push(`/${chain}/explore/collectibles`)
  }
  else if (type === 'NFTs') {
    router.push(`/${chain}/explore/nfts`)
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="space-y-6">
      <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold font-serif italic text-center md:text-left text-gray-900 dark:text-white">
        Explore
      </h1>
    </div>

    <!-- Controls Row -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <!-- Left Side - Chain and Type Controls -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- Type Toggle -->
        <div class="flex bg-accent rounded-full p-1">
          <UButton
            v-for="type in typeOptions"
            :key="type"
            :variant="selectedType === type ? 'solid' : 'ghost'"
            class="rounded-full px-4 py-2 text-sm font-medium"
            @click="handleTypeChange(type)"
          >
            {{ type }}
          </UButton>
        </div>
      </div>

      <!-- Right Side - Slot for page-specific controls -->
      <div class="flex items-center gap-3 flex-wrap">
        <slot name="controls" />
      </div>
    </div>
  </div>
</template>
