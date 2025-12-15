<script lang="ts" setup>
import type { AssetHubChain } from '~/plugins/sdk.client'
import { chainSpec } from '@/utils/chain'
import { formatAmountWithRound } from '@/utils/format/balance'

const props = withDefaults(
  defineProps<{
    value?: number | string
    inline: boolean
    hideUnit?: boolean
    unitSymbol?: string
    round?: number
    chain?: AssetHubChain
  }>(),
  {
    value: 0,
    unitSymbol: '',
  },
)

const { decimals, chainSymbol } = useChain()

const displayUnit = computed(() => props.chain ? chainSpec[props.chain].tokenSymbol : props.unitSymbol || chainSymbol.value)
const finalValue = computed(() =>
  formatAmountWithRound(props.value, decimals.value, props.round),
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
