<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { chainSpec, isAssetHubChain } from '~/utils/chain'

interface Props {
  /**
   * Show label text before the switcher
   */
  showLabel?: boolean
}

const { showLabel = true } = defineProps<Props>()

const route = useRoute()
const router = useRouter()

// Chain options for Asset Hub chains
const chainOptions = [
  {
    value: 'ahp' as AssetHubChain,
    label: chainSpec.ahp.name,
    avatar: {
      src: '/token/dot.svg',
      alt: chainSpec.ahp.name,
    },
    tokenSymbol: chainSpec.ahp.tokenSymbol,
  },
  {
    value: 'ahk' as AssetHubChain,
    label: chainSpec.ahk.name,
    avatar: {
      src: '/token/ksm.svg',
      alt: chainSpec.ahk.name,
    },
    tokenSymbol: chainSpec.ahk.tokenSymbol,
  },
]

// Get current chain from route params
const currentChain = computed(() => {
  const { chain } = route.params
  return typeof chain === 'string' && isAssetHubChain(chain) ? chain : 'ahp'
})

// Get current selected chain option (for display purposes if needed later)
const selectedChain = computed(() => {
  return chainOptions.find(option => option.value === currentChain.value) || chainOptions[0]
})

function handleChainChange(newChain: AssetHubChain) {
  if (newChain === currentChain.value)
    return

  // Replace the chain parameter in the current path
  const currentPath = route.path
  const pathParts = currentPath.split('/')

  // Find and replace the chain part (should be the first non-empty part)
  if (pathParts.length >= 2) {
    pathParts[1] = newChain
    const newPath = pathParts.join('/')

    // Preserve query parameters
    router.push({
      path: newPath,
      query: route.query,
    })
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span
      v-if="showLabel"
      class="text-sm font-medium text-gray-600 dark:text-gray-400"
    >
      Chain:
    </span>

    <USelectMenu
      :model-value="currentChain"
      :items="chainOptions"
      value-key="value"
      :avatar="selectedChain?.avatar"
      @update:model-value="handleChainChange($event)"
    />
  </div>
</template>
