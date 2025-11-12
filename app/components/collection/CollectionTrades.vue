<script setup lang="ts">
import type { TradeTableQuery } from '@/components/trade/TradeActivityTable.client.vue'
import type { TradeType } from '@/components/trade/types'
import { isTradeOffer } from '@/composables/useTradeType'

defineProps<{
  tradeType: TradeType
}>()

const route = useRoute()

const collectionId = computed(() => route.params?.collection_id?.toString())
const tradeCollection = computed(() => route.query.trade_collection === 'true')

function getTradeQuery(direction: 'incoming' | 'outgoing') {
  const directionQuery = {
    incoming: `considered: { id_eq: "${collectionId.value}" }`,
    outgoing: `nft: { collection: { id_eq: "${collectionId.value}" } }`,
  }[direction]

  const where = [
    'status_eq: ACTIVE',
    directionQuery,
  ]

  if (tradeCollection.value && direction === 'incoming') {
    where.push(`desired_isNull: true`)
  }

  return `{ ${where.join(', ')} }`
}

const tradeQuery = computed<TradeTableQuery>(() => ({
  incoming: getTradeQuery('incoming'),
  outgoing: getTradeQuery('outgoing'),
}))

const key = computed(() => JSON.stringify(tradeQuery.value))
</script>

<template>
  <div class="w-full">
    <TradeActivityTable
      :key="key"
      :query="tradeQuery"
      :type="tradeType"
    >
      <template
        v-if="collectionId"
        #filters="{ activeTab }"
      >
        <FilterButton
          class="capitalize"
          variant="outline"
          url-param="trade_collection"
          :label="`Only Collection ${tradeType}s`"
          :disabled="activeTab === 'outgoing'"
        />
      </template>
      <template
        v-if="collectionId"
        #action
      >
        <CreateCollectionOfferButton
          v-if="isTradeOffer(tradeType)"
          :collection-id="collectionId"
        />
      </template>
    </TradeActivityTable>
  </div>

  <LazyMakeOfferModal />
</template>
