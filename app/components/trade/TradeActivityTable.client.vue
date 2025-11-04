<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { DocumentNode } from 'graphql'
import type { TradeConsidered, TradeNftItem, TradeToken, TradeType } from '@/components/trade/types'
import type { SwapSurcharge } from '~/composables/onchain/useNftPallets'
import TradeActivityTableRowItem from '@/components/trade/ActivityTable/RowItem.vue'
import TradeActivityTableRowItemCollection from '@/components/trade/ActivityTable/RowItemCollection.vue'

import { graphql } from '~/graphql/client'

type TradeTabType = 'outgoing' | 'incoming'
export type TradeTableQuery = Record<TradeTabType, string>

const props = defineProps<{
  type: TradeType
  query: TradeTableQuery
}>()

const route = useRoute()
const router = useRouter()
const { $i18n } = useNuxtApp()

const dataKey = TRADES_QUERY_MAP[props.type].dataKey

const selectedTrade = ref<TradeNftItem>()
const isTradeModalOpen = ref(false)

const tradeIds = ref<{ incoming: string[], outgoing: string[] }>()
const activeTab = ref<TradeTabType>(route.query.filter?.toString() as TradeTabType || 'outgoing')

const tabs = ref([{
  id: 'outgoing' as TradeTabType,
  icon: 'mdi:arrow-up',
}, {
  id: 'incoming' as TradeTabType,
  icon: 'mdi:arrow-down',
}])

const tabTarget = computed(() => activeTab.value === 'outgoing' ? 'to' : 'from')
const isIncomingActive = computed(() => activeTab.value === 'incoming')
const isOutgoingActive = computed(() => activeTab.value === 'outgoing')

const where = computed(() => {
  if (!tradeIds.value) {
    return {}
  }

  const id_in = [] as string[][]

  if (isOutgoingActive.value) {
    id_in.push(tradeIds.value.outgoing)
  }

  if (isIncomingActive.value) {
    id_in.push(tradeIds.value.incoming)
  }

  return { id_in: id_in.flat() }
})

const { items: trades, loading: loadingTrades } = useTrades({ where, disabled: computed(() => !Object.keys(where.value).length), type: props.type })

function getRowConfig(trade: TradeNftItem): { offered: TradeItem, desired: TradeItem } {
  const direction = trade.surcharge!
  const surcharge = trade.surcharge ? { amount: trade.price, direction: 'Send' } : undefined

  const desired = trade.desired

  const offered = {
    item: trade.offered,
    surcharge: direction === 'Send' ? surcharge : undefined,
  } as TradeItem

  return tabTarget.value === 'from'
    ? ({
        offered,
        desired: {
          item: desired,
          surcharge: direction === 'Receive' ? surcharge : undefined,
        } as TradeItem,
      })
    : ({
        offered,
        desired: {
          item: (trade.isAnyTokenInCollectionDesired ? trade.considered : trade.desired),
          surcharge: direction === 'Receive' ? surcharge : undefined,
        } as TradeItem,
      })
}

function getTargetAddress(trade: TradeNftItem) {
  return tabTarget.value === 'to' ? (trade.desired || trade.considered).currentOwner : trade.caller
}

const columns = computed<TableColumn<TradeNftItem>[]>(() => {
  return [
    {
      accessorKey: 'offered',
      header: 'Offered',
      cell: ({ row }) => {
        const trade = row.original
        const { desired } = getRowConfig(trade)

        if (trade.isAnyTokenInCollectionDesired) {
          return h(TradeActivityTableRowItemCollection, {
            considered: trade.considered,
            surcharge: trade.surcharge || undefined,
          })
        }

        return h(TradeActivityTableRowItem, {
          item: desired.item,
          surcharge: trade.surcharge || undefined,
        })
      },
    },
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
      header: tabTarget.value === 'from' ? $i18n.t('general.from') : $i18n.t('general.to'),
      cell: ({ row }) => {
        const trade = row.original

        return h(resolveComponent('UserInfo'), {
          address: getTargetAddress(trade),
          avatarSize: 20,
          transparentBackground: true,
          class: '!p-0',
        })
      },
    },
    {
      // Tags
      header: ' ',
      cell: ({ row }) => {
        const trade = row.original

        return h(resolveComponent('TradeTags'), {
          trade,
          class: 'h-full',
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

const loading = computed(() => loadingTrades.value || !tradeIds.value)

interface TradeItem { item: TradeToken | TradeConsidered, surcharge: SwapSurcharge }

watch(activeTab, value => router.replace({ query: { ...route.query, filter: value } }))

useSubscriptionGraphql<DocumentNode, { incoming: { id: string }[], outgoing: { id: string }[] }>({
  query: graphql(`
    query tabsTradeIds {
      incoming: ${dataKey} (
        where: ${props.query.incoming}
        orderBy: blockNumber_DESC
      ) { id }
      outgoing: ${dataKey} (
        where: ${props.query.outgoing}
        orderBy: blockNumber_DESC
      ) { id }
    }
  `),
  onChange: ({ data }) => {
    tradeIds.value = {
      incoming: data.incoming.map(item => item.id),
      outgoing: data.outgoing.map(item => item.id),
    }
  },
})
</script>

<template>
  <div>
    <div class="flex justify-between mb-5 content-center flex-wrap gap-4">
      <div class="flex gap-4! items-center flex-wrap">
        <UButton
          v-for="filter in tabs"
          :key="filter.id"
          :variant="filter.id === activeTab ? 'solid' : 'outline'"
          class="capitalize"
          :icon="filter.icon"
          @click="activeTab = filter.id"
        >
          <div class="flex gap-2">
            <span>{{ filter.id }}</span>
            <span
              v-if="tradeIds?.[filter.id].length"
              class="text-gray-600 dark:text-gray-400"
            >
              ({{ tradeIds[filter.id].length || '' }})
            </span>
          </div>
        </UButton>
      </div>
      <slot name="action" />
    </div>

    <USeparator class="mb-10 mt-0" />

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
