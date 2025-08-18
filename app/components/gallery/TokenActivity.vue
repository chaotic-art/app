<script setup lang="ts">
import type { TokenActivityData } from '~/graphql/queries/token'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { formatBalance } from 'dedot/utils'
import UserInfo from '~/components/common/UserInfo.vue'
import { tokenActivity } from '~/graphql/queries/token'
import { formatToNow } from '~/utils/format/time'

interface Props {
  chain: AssetHubChain
  collectionId: string
  tokenId: string
}

type ActivityFilter = 'MINT' | 'BUY' | 'LIST' | 'SEND' | 'BURN'

interface FilterOption {
  value: ActivityFilter
  label: string
  icon: string
}

const props = defineProps<Props>()
const { $apolloClient } = useNuxtApp()
const { decimalsOf } = useChain()
const selectedFilters = ref<ActivityFilter[]>(['MINT', 'LIST', 'BUY'])
const tokenActivityData = ref<TokenActivityData['events']>([])

const filterOptions: FilterOption[] = [
  { value: 'MINT', label: 'Mints', icon: 'i-heroicons-plus-circle' },
  { value: 'BUY', label: 'Sales', icon: 'i-heroicons-banknotes' },
  { value: 'LIST', label: 'Listings', icon: 'i-heroicons-tag' },
  { value: 'SEND', label: 'Transfers', icon: 'i-heroicons-arrow-right-circle' },
  { value: 'BURN', label: 'Burns', icon: 'i-heroicons-fire' },
]

// Helper function for event handling
function getEventLabel(interaction: string): string {
  const labelMap: Record<string, string> = {
    MINT: 'Minted',
    BUY: 'Sold',
    LIST: 'Listed',
    SEND: 'Transferred',
    BURN: 'Burned',
  }
  return labelMap[interaction] || interaction
}

watchEffect(async () => {
  const { data } = await $apolloClient.query({
    query: tokenActivity,
    variables: {
      limit: 20,
      orderBy: [
        'blockNumber_DESC',
      ],
      where: {
        nft: {
          collection: {
            id_eq: props.collectionId,
          },
          sn_eq: props.tokenId,
        },
        interaction_in: selectedFilters.value,
      },
    },
    context: {
      endpoint: props.chain,
    },
  })

  tokenActivityData.value = data.events
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 class="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
        Item Activity
      </h2>

      <USelect
        v-model="selectedFilters"
        :items="filterOptions"
        multiple
        placeholder="Filter activity"
        value-key="value"
        :content="{ align: 'end', side: 'bottom' }"
        class="w-full sm:w-48 shrink-0"
        color="neutral"
        variant="outline"
        size="sm"
      />
    </div>

    <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <!-- Activity Table -->
      <UTable
        sticky
        :data="tokenActivityData"
        class="max-h-[380px]"
        :columns="[
          {
            accessorKey: 'interaction',
            header: 'Event',
            cell: ({ row }) => getEventLabel(row.getValue('interaction')),
          },
          {
            accessorKey: 'meta',
            header: 'Price',
            cell: ({ row }) => {
              const meta = row.getValue('meta') as string
              const format = formatBalance(meta, {
                decimals: decimalsOf('ahp'), // TODO: handle asset hub chains
                symbol: tokenSymbolOf('ahp'), // TODO: handle asset hub chains
              })

              return meta && meta !== '0' ? format : '-'
            },
          },
          {
            accessorKey: 'caller',
            header: 'From',
            cell: ({ row }) => {
              const caller = row.getValue('caller')
              const interaction = row.getValue('interaction')
              if (caller && interaction !== 'MINT') {
                return h(UserInfo, {
                  address: caller as string,
                  avatarSize: 24,
                  transparentBackground: true,
                  class: 'justify-end',
                })
              }
              return '-'
            },
          },
          {
            accessorKey: 'to',
            header: 'To',
            cell: ({ row }) => {
              const interaction = row.getValue('interaction')
              const meta = row.getValue('meta')
              const caller = row.getValue('caller')

              if (interaction === 'SEND' && meta) {
                return h(UserInfo, {
                  address: meta as string,
                  avatarSize: 24,
                  transparentBackground: true,
                  class: 'justify-end',
                })
              }
              if (interaction === 'BUY') {
                return h(UserInfo, {
                  address: caller as string,
                  avatarSize: 24,
                  transparentBackground: true,
                  class: 'justify-end',
                })
              }
              return '-'
            },
          },
          {
            accessorKey: 'timestamp',
            header: 'Date',
            cell: ({ row }) => formatToNow(row.getValue('timestamp') as string),
          },
        ]"
        :ui="{
          thead: 'bg-neutral-50 dark:bg-neutral-900',
          th: 'px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-700',
          td: 'px-4 py-3',
          tbody: 'divide-y divide-neutral-100 dark:divide-neutral-700',
        }"
        empty="No activity yet"
      />
    </div>
  </div>
</template>
