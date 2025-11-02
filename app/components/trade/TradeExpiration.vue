<script setup lang="ts">
import type { TradeNftItem } from '@/components/trade/types'
import { formatToNow } from '@/utils/format/time'

const props = withDefaults(
  defineProps<{
    trade: TradeNftItem
    withPrefix?: boolean
    blank?: string
  }>(),
  {
    blank: '--',
  },
)

const { $i18n } = useNuxtApp()

const label = computed(() => {
  const formatted = formatToNow(props.trade.expirationDate, props.trade.isExpired)

  return props.withPrefix ? `${$i18n.t('trades.expiresIn')} ${formatted}` : formatted
})
</script>

<template>
  <div
    v-if="trade.expirationDate && !trade.isExpired"
    class="flex items-center gap-3"
  >
    <UIcon name="mdi:clock-outline" size="18" />
    <span class="capitalize"> {{ label }}</span>
  </div>
  <span v-else>
    {{ blank }}
  </span>
</template>
