<script setup lang="ts">
import type { TradeDetailedToken } from './utils'
import type { TradeNftItem } from '@/components/trade/types'
import { useIsTradeOverview } from './utils'

const props = defineProps<{
  trade: TradeNftItem
  desired?: TradeDetailedToken
}>()

const { decimals, chainSymbol } = useChain()
const { isIncomingTrade } = useIsTradeOverview(computed(() => props.trade))
const { isOffer } = useTradeType(computed(() => props.trade))

function getFormattedDifference(a: number, b: number) {
  if (b === 0 && a === 0) {
    return '-'
  }

  if (b === 0 && a > 0) {
    return '+100%'
  }

  const diff = ((b - a) / b) * 100

  return diff > 0
    ? `-${diff.toFixed()}%`
    : `+${Math.abs(diff).toFixed()}%`
}

const floorPrice = computed(() => Number(props.desired?.collection.floor) || 0)
const diff = computed(() => getFormattedDifference(Number(props.trade.price || 0), floorPrice.value))

const { formatted: formmatedOffer, usd: offerUsd } = useAmount(
  computed(() => props.trade?.price),
  decimals,
  chainSymbol,
)
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-if="isOffer"
      class="flex justify-between items-center"
    >
      <span class="text-gray-600 dark:text-gray-400 text-xs">
        {{ $t('general.amount') }}
      </span>

      <p class="flex gap-2 items-center">
        <span>{{ formmatedOffer }}</span>
        <span class="text-gray-600 dark:text-gray-400 text-xs">({{ offerUsd }})</span>
      </p>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-gray-600 dark:text-gray-400 text-xs">
        {{ $t('general.expiration') }}
      </span>

      <TradeExpiration
        :trade="trade"
        :blank="$t('general.expired')"
      />
    </div>

    <div
      v-if="isOffer && isIncomingTrade && desired"
      class="flex justify-between items-center"
    >
      <span class="text-gray-600 dark:text-gray-400 text-xs">
        {{ $t('offer.floorDifference') }}
      </span>

      <span>
        {{ diff }}
      </span>
    </div>
  </div>
</template>
