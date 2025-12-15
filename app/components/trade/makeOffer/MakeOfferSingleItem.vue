<script setup lang="ts">
import type { MakingOfferItem } from '../types'
import CartItemDetails from '@/components/common/CartItemDetails.vue'
import { useMakingOfferStore } from '@/stores/makeOffer'

const props = defineProps<{
  item: MakingOfferItem
}>()

const offerPrice = defineModel('offerPrice', { type: Number, default: 0 })

const offerStore = useMakingOfferStore()
const { chainSymbol, decimals } = useChain()

const offerPriceStoreItem = computed({
  get: () => offerStore.getItem(props.item.id)?.offerPrice,
  set: price => offerStore.updateItem({ id: props.item.id, offerPrice: price }),
})
const offerExpirationStoreItem = computed({
  get: () => offerStore.getItem(props.item.id)?.offerExpiration,
  set: v => offerStore.updateItem({ id: props.item.id, offerExpiration: v }),
})

const { formatted: highestOfferPrice } = useAmount(computed(() => props.item.highestOffer || 0), decimals, chainSymbol, { withBlank: true })
const { formatted: collectionFloorPrice } = useAmount(computed(() => props.item.collection.floor || 0), decimals, chainSymbol, { withBlank: true })

watch(
  () => props.item.price,
  (value) => {
    if (value) {
      offerPrice.value = Number(value)
    }
  },
)
</script>

<template>
  <div>
    <CartItemDetails
      v-if="item"
      :name="item.name || ''"
      :image="item.meta?.image || '' "
      :collection-name="item.collection.metadata?.name || '' "
      :price="Number(item.price)"
    />

    <USeparator class="my-4" />

    <div class="mb-2 flex justify-between">
      <div class="text-gray-600 dark:text-gray-400">
        {{ $t('offer.bestOffer') }}
      </div>
      <div>{{ highestOfferPrice }}</div>
    </div>

    <div class="flex justify-between">
      <div class="text-gray-600 dark:text-gray-400">
        {{ $t('offer.collectionFloorPrice') }}
      </div>
      <div>{{ collectionFloorPrice }}</div>
    </div>

    <USeparator class="my-4" />

    <div class="font-bold">
      {{ $t('offer.yourOfferAmount') }}
    </div>

    <TradePriceInput
      v-model="offerPriceStoreItem"
      class="pt-2"
    />

    <div class="font-bold pt-4">
      {{ $t('offer.expiration') }}
    </div>

    <TradeExpirationSelector
      v-model="offerExpirationStoreItem"
      class="pt-2"
    />
  </div>
</template>
