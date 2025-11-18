<script setup lang="ts">
import type { TradeConsidered } from '@/components/trade/types'
import type { SwapSurcharge } from '@/composables/onchain/useNftPallets'
import TradeActivityTableSurchargeTag from '@/components/trade/ActivityTable/SurchargeTag.vue'

defineProps<{
  considered: TradeConsidered
  surcharge: SwapSurcharge | undefined
}>()

const { currentChain } = useChain()
</script>

<template>
  <div class="bg-gray-200 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg h-full px-3!">
    <span class="text-gray-600 dark:text-gray-400 capitalize"> {{ $t('trades.anyNftFrom') }} </span>
    <div class="flex items-center gap-2">
      <nuxt-link
        :to="`/${currentChain}/collection/${considered.id}`"
        class="font-bold"
      >
        {{ considered.name }}
      </nuxt-link>

      <TradeActivityTableSurchargeTag :value="surcharge" />
    </div>
  </div>
</template>
