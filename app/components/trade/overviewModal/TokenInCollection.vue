<script setup lang="ts">
import type { TradeDetailedToken } from './utils'
import type { TradeNftItem } from '@/components/trade/types'
import CollectionItemDetails from './CollectionItemDetails.vue'
import TokenItemDetails from './TokenItemDetails.vue'
import TokenSearchInput from './TokenSearchInput.vue'

const props = defineProps<{
  sendItem?: TradeDetailedToken | null
  trade: TradeNftItem
  title?: string
}>()
defineEmits(['sendItemSelect', 'sendItemClear'])

const selected = ref()
const { accountId } = useAuth()
const { isTargetOfTrade } = useIsTrade(computed(() => props.trade), accountId)
</script>

<template>
  <div
    class="flex flex-col gap-4"
  >
    <div class="flex flex-col gap-2">
      <div
        v-if="title"
        class="text-sm capitalize text-gray-600 dark:text-gray-400"
      >
        {{ title }}
      </div>
      <CollectionItemDetails
        :trade="trade"
      />
    </div>
    <div
      v-if="isTargetOfTrade"
      class="flex flex-col gap-2"
    >
      <div class="flex justify-between items-center h-6">
        <div class="text-sm font-semibold capitalize">
          To trade
        </div>

        <UButton
          v-if="sendItem"
          @click="() => {
            selected = undefined
            $emit('sendItemClear')
          }"
        >
          <UIcon
            name="mdi:close"
            size="small"
          />
        </UButton>
      </div>

      <TokenItemDetails
        v-if="selected"
        :nft="sendItem!"
        :type="trade.type"
      />

      <TokenSearchInput
        v-else
        :where="{
          currentOwner_eq: accountId,
          collection: {
            id_eq: trade.considered.id,
          },
        }"
        @select="sendItem => {
          selected = sendItem
          $emit('sendItemSelect', sendItem)
        }"
      />
    </div>
  </div>
</template>
