<script setup lang="ts">
import type { SwapSurcharge } from '@/composables/onchain/useNftPallets'
import { formatBalance } from 'dedot/utils'

const props = defineProps<{
  value: SwapSurcharge | undefined
}>()

const { $i18n } = useNuxtApp()
const { decimals, chainSymbol } = useChain()

const config = computed(() => {
  if (!props.value) {
    return
  }

  const amount = formatBalance(props.value?.amount, { decimals: decimals.value, symbol: chainSymbol.value })

  return props.value.direction === 'Receive'
    ? ({ label: $i18n.t('trades.requests', [amount]), color: 'warning' as const })
    : ({ label: `+${amount}`, color: 'info' as const })
})
</script>

<template>
  <UBadge
    v-if="config"
    size="sm"
    :color="config.color"
    class="w-min"
  >
    <span> {{ config.label }} </span>
  </UBadge>
</template>
