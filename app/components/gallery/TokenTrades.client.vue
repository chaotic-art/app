<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { TradeNftItem, TradeType } from '@/components/trade/types'
import type { AssetHubChain } from '~/plugins/sdk.client'
import TradeActivityTableRowItem from '@/components/trade/ActivityTable/RowItem.vue'
import { TradeTypes } from '@/components/trade/types'
import { isTradeSwap } from '@/composables/useTradeType'
import { activeOffersIdsByNftId, activeSwapsIdsByNftId } from '~/graphql/queries/trades'

const props = defineProps<{
  chain: AssetHubChain
  collectionId: string
  tokenId: string
  type: TradeType
}>()

const { $i18n } = useNuxtApp()
const { chainSymbol, decimals } = useChain()

const selectedTrade = ref<TradeNftItem>()
const isTradeModalOpen = ref(false)
const tradeIds = ref()

const { items: trades, loading } = useTrades({
  where: computed(() => ({ id_in: tradeIds.value })),
  disabled: computed(() => !Array.isArray(tradeIds.value)),
  type: props.type,
})

useSubscriptionGraphql({
  query: {
    [TradeTypes.Offer]: activeOffersIdsByNftId,
    [TradeTypes.Swap]: activeSwapsIdsByNftId,
  }[props.type],
  variables: { id: `${props.collectionId}-${props.tokenId}` },
  onChange: ({ data }) => {
    tradeIds.value = data.items?.map(trade => trade.id)
  },
})

const columns = computed<TableColumn<TradeNftItem>[]>(() => {
  return [
    ...isTradeSwap(props.type)
      ? [{
          accessorKey: 'item',
          header: $i18n.t('offer.offer'),
          cell: ({ row: { original: trade } }) => {
            return h(TradeActivityTableRowItem, {
              item: trade.offered,
              surcharge: trade.surcharge ? { amount: trade.price, direction: trade.surcharge } : undefined,
            })
          },
        }] as TableColumn<TradeNftItem>[]
      : [
          {
            accessorKey: 'price',
            header: $i18n.t('general.amount'),
            cell: ({ row }) => {
              const trade = row.original

              const { usd } = useAmount(computed(() => trade.price), decimals, chainSymbol)

              return h('div', { class: 'flex items-center gap-2' }, [
                h(resolveComponent('Money'), {
                  value: trade.price,
                  inline: true,
                }),
                h('div', { class: 'text-xs text-gray-500 dark:text-gray-400' }, `(${usd.value})`),
              ])
            },
          },
        ] as TableColumn<TradeNftItem>[],
    {
      header: isTradeSwap(props.type) ? $i18n.t('swap.counterparty') : $i18n.t('general.from'),
      cell: ({ row }) => {
        const trade = row.original

        return h(resolveComponent('UserInfo'), {
          address: trade.caller,
          avatarSize: 20,
          transparentBackground: true,
          class: '!p-0',
        })
      },
    },
    {
      header: $i18n.t('general.expiration'),
      cell: ({ row }) => {
        const trade = row.original

        return h(resolveComponent('TradeExpiration'), {
          trade,
        })
      },
    },
    {
      header: ' ',
      cell: ({ row }) => {
        const trade = row.original

        return h(resolveComponent('TradeOwnerButton'), {
          trade,
          onClickMain: () => {
            selectedTrade.value = trade
            isTradeModalOpen.value = true
          },
        })
      },
    },
  ]
})
</script>

<template>
  <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
    <UTable
      :data="trades"
      :columns="columns"
      :loading="loading"
    />
  </div>

  <TradeOverviewModal
    v-model="isTradeModalOpen"
    :trade="selectedTrade"
    @close="() => {
      selectedTrade = undefined
      isTradeModalOpen = false
    }"
  />
</template>
