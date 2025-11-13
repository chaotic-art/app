<script lang="ts" setup>
import type { SwapSurcharge } from '~/composables/onchain/useNftPallets'
import { SwapStep } from '@/components/swap/types'

const props = defineProps<{
  query: Record<string, any>
  selectable?: boolean
  withFilters?: boolean
  surcharge?: SwapSurcharge
}>()

const MAX_AMOUNT_OF_SWAP_ITEMS = 1

const { stepItems, swap, step } = storeToRefs(useAtomicSwapStore())

const extraQuery = ref<Record<string, any>>()

const query = computed(() => ({ ...extraQuery.value, search: { ...props.query, ...extraQuery.value?.search || {} } }))
</script>

<template>
  <div class="flex flex-col gap-4">
    <SwapGridListFilters
      v-if="withFilters"
      :query="props.query"
      @update:query-variables="extraQuery = $event"
    />

    <NftsGrid
      :key="JSON.stringify(query)"
      :grid-class="`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${step !== SwapStep.REVIEW ? 'xl:grid-cols-4' : ''} gap-4`"
      :variables="query"
      :prefix="swap.chain"
      :hide-hover-action="!selectable ? true : stepItems.length === MAX_AMOUNT_OF_SWAP_ITEMS"
    >
      <template
        v-if="surcharge"
        #additional-item
      >
        <SwapSurchargeCard
          :surcharge="surcharge"
        />
      </template>
    </NftsGrid>
  </div>
</template>
