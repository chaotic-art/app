<script setup lang="ts">
import type { TradeDetailedToken } from './utils'
import type { TradeNftItem } from '@/components/trade/types'
import OverviewModalDetails from './Details.vue'
import TokenInCollection from './TokenInCollection.vue'
import TokenItemDetails from './TokenItemDetails.vue'
import { useIsTradeOverview } from './utils'

const props = defineProps<{
  desired?: TradeDetailedToken
  offered: TradeDetailedToken
  trade: TradeNftItem
  sendItem?: TradeDetailedToken | null
}>()
defineEmits(['sendItemSelect', 'sendItemClear'])
const { $i18n } = useNuxtApp()

const { isMyTrade } = useIsTradeOverview(computed(() => props.trade))
const { isSwap } = useTradeType(computed(() => props.trade))
const key = computed(() => `trades.${isMyTrade.value ? 'outgoing' : 'incoming'}`)
const offeredTitle = computed(() => isSwap.value ? $i18n.t(`${key.value}.send`) : undefined)
const desiredTitle = computed(() => isSwap.value ? $i18n.t(`${key.value}.receive`) : undefined)
</script>

<template>
  <div
    class="py-5"
  >
    <div
      class="flex flex-col gap-4"
      :class="{
        'flex-col-reverse': isMyTrade && isSwap,
      }"
    >
      <!-- Desired  -->
      <TokenInCollection
        v-if="trade.isAnyTokenInCollectionDesired"
        :trade="trade"
        :send-item="sendItem"
        :title="desiredTitle"
        @send-item-select="$emit('sendItemSelect', $event)"
        @send-item-clear="$emit('sendItemClear')"
      />
      <TokenItemDetails
        v-else-if="desired"
        :nft="desired"
        :type="trade.type"
        :title="desiredTitle"
        :surcharge="isSwap && trade.surcharge === 'Receive' ? { direction: 'Send', amount: trade.price } : undefined"
      />

      <template v-if="isSwap">
        <UIcon
          class="rotate-90 text-gray-900 dark:text-white"
          name="mdi:swap-horizontal"
        />

        <!-- Offered -->
        <TokenItemDetails
          :nft="offered"
          :type="trade.type"
          :title="offeredTitle"
          :surcharge="isSwap && trade.surcharge === 'Send' ? { direction: 'Send', amount: trade.price } : undefined"
        />
      </template>
    </div>

    <USeparator class="my-5" />

    <OverviewModalDetails
      :trade="trade"
      :desired="desired"
    />
  </div>
</template>
