<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { DocumentNode } from 'graphql'
import type { TradeNftItem } from '@/components/trade/types'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { TradeType } from '@/components/trade/types'
import { graphql } from '~/graphql/client'

const props = defineProps<{
  chain: AssetHubChain
  collectionId: string
  tokenId: string
}>()

const { $i18n } = useNuxtApp()

const selectedTrade = ref<TradeNftItem>()
const isTradeModalOpen = ref(false)
const tradeIds = ref()

const { items: trades, loading } = useTrades({
  where: computed(() => ({ id_in: tradeIds.value })),
  disabled: computed(() => !Array.isArray(tradeIds.value)),
  type: TradeType.OFFER,
})

useSubscriptionGraphql<DocumentNode, { items: { id: string }[] }>({
  query: graphql(`
    query tradeIds {
        items: offers (
        where: { status_eq: ACTIVE, desired: { id_eq: "${props.collectionId}-${props.tokenId}" } }
        orderBy: blockNumber_DESC
      ) {
        id
      }
    }
  `),
  onChange: ({ data }) => {
    tradeIds.value = data.items?.map(trade => trade.id)
  },
})

const columns = computed<TableColumn<TradeNftItem>[]>(() => {
  return [
    {
      accessorKey: 'price',
      header: $i18n.t('general.amount'),
      cell: ({ row }) => {
        const trade = row.original

        return h(resolveComponent('Money'), {
          value: trade.price,
          inline: true,
        })
      },
    },
    {
      header: $i18n.t('general.from'),
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
          class: 'mt-5',
          detailed: true,
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
