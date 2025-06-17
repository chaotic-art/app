<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface SizeConfig {
  container: string
  image: string
  text: string
  overlap: string
}

const props = withDefaults(
  defineProps<{
    wallets: WalletExtension[]
    maxVisible?: number
    size?: Size
  }>(),
  {
    maxVisible: 3,
    size: 'md',
  },
)

const sizeMap: Record<Size, SizeConfig> = {
  sm: {
    container: 'h-6',
    image: 'w-6 h-6',
    text: 'text-xs',
    overlap: '-ml-1',
  },
  md: {
    container: 'h-8',
    image: 'w-8 h-8',
    text: 'text-xs',
    overlap: '-ml-2',
  },
  lg: {
    container: 'h-10',
    image: 'w-10 h-10',
    text: 'text-sm',
    overlap: '-ml-2.5',
  },
  xl: {
    container: 'h-12',
    image: 'w-12 h-12',
    text: 'text-sm',
    overlap: '-ml-3',
  },
}

const visibleWallets = computed(() => props.wallets.slice(0, props.maxVisible))
const remainingCount = computed(() => Math.max(0, props.wallets.length - props.maxVisible))

const sizeClasses = computed(() => sizeMap[props.size])
</script>

<template>
  <div class="flex items-center" :class="sizeClasses.container">
    <div
      v-for="(wallet, index) in visibleWallets"
      :key="wallet.id"
      class="relative rounded-full border-2 border-white dark:border-gray-900 bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden"
      :class="[
        sizeClasses.image,
        index > 0 ? sizeClasses.overlap : '',
      ]"
      :style="{ zIndex: visibleWallets.length - index }"
      :title="wallet.name"
    >
      <img
        v-if="wallet.icon"
        :src="wallet.icon"
        :alt="`${wallet.name} logo`"
        class="w-full h-full object-contain p-1"
      >
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700"
      >
        <UIcon
          name="i-lucide-wallet"
          class="w-4 h-4 text-gray-500 dark:text-gray-400"
        />
      </div>
    </div>

    <div
      v-if="remainingCount > 0"
      class="relative rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
      :class="[
        sizeClasses.image,
        sizeClasses.overlap,
        sizeClasses.text,
      ]"
      :style="{ zIndex: 0 }"
      :title="`+${remainingCount} more wallets`"
    >
      <span class="font-medium text-gray-600 dark:text-gray-300">
        +{{ remainingCount }}
      </span>
    </div>
  </div>
</template>
