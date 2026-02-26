<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { chainSpec } from '~/utils/chain'

withDefaults(
  defineProps<{
    /** Show label text before the switcher */
    showLabel?: boolean
    /** Compact trigger mode for constrained spaces */
    compact?: boolean
  }>(),
  {
    showLabel: true,
    compact: false,
  },
)

const route = useRoute()
const router = useRouter()
const { currentChain } = useChain()

// Chain options for Asset Hub chains
const chainOptions = [
  {
    value: 'ahp' as AssetHubChain,
    label: chainSpec.ahp.name,
    avatar: {
      src: '/token/dot.svg',
      alt: chainSpec.ahp.name,
    },
  },
  {
    value: 'ahk' as AssetHubChain,
    label: chainSpec.ahk.name,
    avatar: {
      src: '/token/ksm.svg',
      alt: chainSpec.ahk.name,
    },
  },
]

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
      v-if="showLabel && !compact"
      class="text-sm font-medium text-gray-600 dark:text-gray-400"
    >
      Chain:
    </span>

    <USelectMenu
      :class="compact ? 'w-11' : undefined"
      :model-value="currentChain"
      :items="chainOptions"
      :search-input="false"
      :content="compact ? { align: 'end', side: 'bottom', sideOffset: 8 } : { side: 'bottom', sideOffset: 8 }"
      :ui="compact ? { content: 'min-w-44' } : {}"
      value-key="value"
      :avatar="selectedChain?.avatar"
      @update:model-value="handleChainChange($event)"
    >
      <template #item="{ item }">
        <div class="flex items-center gap-2">
          <img :src="item.avatar.src" :alt="item.avatar.alt" class="size-4 rounded-full">
          <span class="whitespace-nowrap">{{ item.label }}</span>
        </div>
      </template>
    </USelectMenu>
  </div>
</template>
