<script lang="ts" setup>
import type { Prefix } from '@kodadot1/static'
import { chainPropListOf } from '@/utils/chain'
import { formatAmountWithRound } from '@/utils/format/balance'

const props = withDefaults(
  defineProps<{
    value?: number | string
    inline: boolean
    hideUnit?: boolean
    unitSymbol?: string
    prefix?: Prefix
    round?: number
  }>(),
  {
    value: 0,
    unitSymbol: '',
    prefix: undefined,
  },
)

const { decimals, chainSymbol } = useChain()

const tokenDecimals = computed(() =>
  props.prefix ? chainPropListOf(props.prefix).tokenDecimals : decimals.value,
)
const displayUnit = computed(
  () =>
    props.unitSymbol
    || (props.prefix ? chainPropListOf(props.prefix).tokenSymbol : chainSymbol.value),
)
const finalValue = computed(() =>
  formatAmountWithRound(props.value, tokenDecimals.value, props.round),
)
</script>

<template>
  <div class="money" :class="[{ 'inline-block': inline }]">
    <span v-if="!hideUnit">
      {{ finalValue }}
      {{ displayUnit }}
    </span>
    <span v-else>
      {{ finalValue }}
    </span>
  </div>
</template>
