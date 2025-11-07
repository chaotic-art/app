<script lang="ts" setup>
import type { TradeTableQuery } from '@/components/trade/TradeActivityTable.client.vue'
import { TradeType } from '@/components/trade/types'

const props = defineProps<{
  address: string
}>()

const { data: ownedCollections } = useOwnedCollections(props.address)

const tradeQuery = computed<TradeTableQuery | null>(() => {
  return ownedCollections.value
    ? {
        incoming: `${buildIncomingTradesQuery(props.address, ownedCollections.value, { stringify: true })}`,
        outgoing: `{ status_in: [ACTIVE, EXPIRED], caller_eq: "${props.address}" }`,
      }
    : null
})
</script>

<template>
  <div class="mt-2">
    <TradeActivityTable
      v-if="tradeQuery"
      :query="tradeQuery"
      :type="TradeType.OFFER"
    />
    <SkeletonTable v-else />
  </div>
</template>
