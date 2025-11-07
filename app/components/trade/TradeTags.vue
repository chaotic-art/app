<script setup lang="ts">
import type { TradeNftItem } from '@/components/trade/types'

defineProps<{
  trade: TradeNftItem
}>()
</script>

<template>
  <div class="flex items-center gap-4">
    <UBadge
      v-if="trade.isAnyTokenInCollectionDesired"
      size="sm"
      color="warning"
    >
      <span>{{ $t('general.collection') }}</span>
    </UBadge>
    <UBadge
      v-if="trade.isExpired"
      size="sm"
      color="info"
    >
      <span>{{ $t('general.expired') }}</span>
    </UBadge>
    <UBadge
      v-else
      size="sm"
      color="success"
    >
      <span>{{ $t('general.active') }}</span>
    </UBadge>
  </div>
</template>
