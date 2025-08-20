<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { chainSpec, isAssetHubChain } from '~/utils/chain'

const route = useRoute()
const router = useRouter()

// Categories for browsing
const typeOptions = ['Collections', 'NFTs']

// Chain options for Asset Hub chains
const chainOptions = [
  { value: 'ahp' as AssetHubChain, label: chainSpec.ahp.name, icon: 'dot' },
  { value: 'ahk' as AssetHubChain, label: chainSpec.ahk.name, icon: 'ksm' },
] as const

// Get current chain from route params
const currentChain = computed(() => {
  const { chain } = route.params
  return typeof chain === 'string' && isAssetHubChain(chain) ? chain : 'ahp'
})

// Get current selected chain option
const selectedChain = computed(() => {
  return chainOptions.find(option => option.value === currentChain.value) || chainOptions[0]
})

// Create dropdown items for UDropdownMenu
const chainDropdownItems = computed(() =>
  chainOptions.map(option => ({
    label: option.label,
    avatar: { src: `/token/${option.icon}.svg` },
    onSelect: () => handleChainChange(option.value),
    class: currentChain.value === option.value ? 'bg-accent' : '',
  })),
)

// Determine selected type based on current route
const selectedType = computed(() => {
  const currentPath = route.path
  if (currentPath.includes('/explore/nfts')) {
    return 'NFTs'
  }
  return 'Collections'
})

function handleTypeChange(type: string) {
  if (type === 'Collections') {
    router.push(`/${currentChain.value}/explore/collectibles`)
  }
  else if (type === 'NFTs') {
    router.push(`/${currentChain.value}/explore/nfts`)
  }
}

function handleChainChange(chain: AssetHubChain) {
  const currentPath = route.path
  if (currentPath.includes('/explore/nfts')) {
    router.push(`/${chain}/explore/nfts`)
  }
  else {
    router.push(`/${chain}/explore/collectibles`)
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
        <!-- Chain Switcher -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Chain:</span>
          <UDropdownMenu :items="chainDropdownItems">
            <UButton
              variant="outline"
              class="min-w-[200px] justify-between"
              trailing-icon="i-heroicons-chevron-down-20-solid"
            >
              <div class="flex items-center gap-2">
                <img
                  :src="`/token/${selectedChain.icon}.svg`"
                  :alt="selectedChain.label"
                  class="w-4 h-4"
                >
                <span class="truncate">{{ selectedChain.label }}</span>
              </div>
            </UButton>
          </UDropdownMenu>
        </div>

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
