<script setup lang="ts">
import type { TradeNftItem } from '@/components/trade/types'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

defineProps<{
  trade: TradeNftItem
}>()
</script>

<template>
  <CartItemDetails
    :name="trade.considered.name"
    :image="sanitizeIpfsUrl(trade.considered.image)"
    :collection-name="$t('general.collection')"
  />
</template>
