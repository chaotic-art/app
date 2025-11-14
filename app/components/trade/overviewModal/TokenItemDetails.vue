<script setup lang="ts">
import type { TradeDetailedToken } from './utils'
import type { TradeType } from '@/components/trade/types'
import type { SwapSurcharge } from '@/composables/onchain/useNftPallets'
import TradeActivityTableSurchargeTag from '@/components/trade/ActivityTable/SurchargeTag.vue'
import { isTradeOffer } from '@/composables/useTradeType'

const props = defineProps<{
  nft?: TradeDetailedToken
  surcharge?: SwapSurcharge
  type: TradeType
  title?: string
}>()

const formattedPrice = ref()
const { decimals, chainSymbol } = useChain()

watchEffect(() => {
  const nft = props.nft
  if (nft) {
    formattedPrice.value = useAmount(
      computed(() => nft.price || 0),
      decimals,
      chainSymbol,
    ).formatted.value
  }
})
</script>

<template>
  <div
    v-if="nft"
    class="flex flex-col gap-3"
  >
    <p
      v-if="title"
      class="text-gray-600 dark:text-gray-400 text-sm"
    >
      {{ title }}
    </p>

    <CartItemDetails
      :name="nft.metadata?.name || ''"
      :image="nft.metadata?.image"
      :collection-name="nft.collection?.metadata?.name || ''"
    >
      <template #right>
        <div class="flex items-end ">
          <TradeActivityTableSurchargeTag
            v-if="surcharge"
            class="w-fit"
            :value="surcharge"
          />

          <span v-else-if="isTradeOffer(type)"> {{ formattedPrice }} </span>
        </div>
      </template>
    </CartItemDetails>
  </div>

  <USkeleton v-else class="h-12 w-full rounded-lg" />
</template>
