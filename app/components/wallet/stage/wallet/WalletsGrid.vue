<script setup lang="ts">
import type { WalletExtension } from '@/stores/wallet/types'

defineProps<{
  extensions: WalletExtension[]
}>()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <slot name="grid" />

    <WalletsGridItem
      v-for="item in extensions" :key="item.id" :item="item"
    >
      <slot :item="item" />
    </WalletsGridItem>
  </div>
</template>
