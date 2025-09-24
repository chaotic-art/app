<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { EventInteraction } from './types'
import { formatDistanceToNow } from 'date-fns'
import { Interaction } from './types'
import { interactionNameMap } from './utils'

const props = defineProps<{
  events: EventInteraction[]
  address: string
  loading?: boolean
}>()

const blank = '-'

type Item = EventInteraction['nft']

export interface Event {
  id: string
  type: string
  from: string
  to: string
  amount: string
  date: string
  time: string
  block: string
  item: Item
  percentage?: number
}

const data = ref<Event[]>([])
const tmpData = ref<Event[]>([])
const page = ref(1)
const itemsPerPage = ref(10)
const { prefix } = usePrefix()

const pageData = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return data.value.slice(start, end)
})

const columns = computed<TableColumn<Event>[]>(() => {
  return [
    {
      accessorKey: 'item',
      header: 'Item',
    },
    {
      accessorKey: 'type',
      header: 'Event',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
    },
    {
      accessorKey: 'from',
      header: 'From',
    },
    {
      accessorKey: 'to',
      header: 'To',
    },
    {
      accessorKey: 'time',
      header: 'Time',
    },
  ]
})

function createTable(): void {
  data.value = []
  tmpData.value = []

  const previousPriceMap: Record<string, number> = {}

  for (const newEvent of props.events) {
    const event = {} as Event

    const nftId = newEvent.nft ? newEvent.nft.id : 'id'
    // type
    switch (newEvent.interaction as keyof typeof Interaction) {
      case Interaction.MINT:
      case Interaction.MINTNFT:
        event.from = newEvent.caller
        event.to = ''
        break
      case Interaction.LIST:
      case Interaction.UNLIST:
        event.type = Number.parseInt(newEvent.meta)
          ? Interaction.LIST
          : Interaction.UNLIST
        event.from = newEvent.caller
        event.to = ''
        event.amount = newEvent.meta
        break
      case Interaction.SEND:
        event.from = newEvent.caller
        event.to = newEvent.meta
        break
      case Interaction.CONSUME:
        event.from = newEvent.caller
        event.to = ''
        break
      case Interaction.BUY:
        if (newEvent.caller !== props.address) {
          event.type = 'SELL'
        }
        event.from = newEvent.currentOwner
        event.to = newEvent.caller
        event.amount = newEvent.meta

        if (previousPriceMap[nftId]) {
          event.percentage
            = ((Number.parseInt(newEvent.meta) - previousPriceMap[nftId])
              / previousPriceMap[nftId])
            * 100
        }
        else {
          event.percentage = 100
        }

        previousPriceMap[nftId] = Number.parseInt(newEvent.meta)

        break
      default:
        // unsupported event
        continue
    }

    event.type = event.type ?? newEvent.interaction

    // item
    event.item = newEvent.nft

    // amount
    event.amount = event.amount ?? '-'

    // date
    const date = new Date(newEvent.timestamp as string)
    event.date = parseDate(date)

    // time
    event.time = formatDistanceToNow(date, { addSuffix: true })

    event.block = String(newEvent.blockNumber)

    // id for table: Use a unique key of your data Object for each row.
    event.id = newEvent.timestamp + newEvent.id

    tmpData.value.push(event)
  }

  data.value = tmpData.value.reverse()
  tmpData.value = []
  page.value = 1
}

watch(() => props.events, () => {
  createTable()
}, { immediate: true })
</script>

<template>
  <div>
    <div class="flex items-center flex-wrap gap-4 justify-between mb-4">
      <slot />

      <template v-if="props.loading">
        <USkeleton class="h-9 w-48 rounded-md" />
      </template>
      <UPagination
        v-else-if="data.length > 0"
        v-model:page="page"
        :total="data.length"
        :items-per-page="itemsPerPage"
      />
    </div>

    <template v-if="props.loading">
      <div class="space-y-2">
        <USkeleton class="h-10 w-full rounded-md" />
        <USkeleton v-for="n in 6" :key="n" class="h-12 w-full rounded-md" />
      </div>
    </template>
    <template v-else-if="data.length === 0">
      <div class="flex items-center justify-center text-center py-16">
        <div>
          <p class="text-xl font-semibold text-neutral-900 dark:text-white mb-1">
            Looks Like There's Nothing Here Yet
          </p>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Check back later or reset your filters
          </p>
        </div>
      </div>
    </template>
    <UTable
      v-else
      :data="pageData"
      :columns="columns"
    >
      <template #item-cell="{ row }">
        <div class="flex-1 overflow-hidden">
          <div class="flex items-center">
            <nuxt-link
              :to="`/${prefix}/gallery/${row.getValue<Item>('item').id}`"
              class="h-[50px]"
            >
              <CartItemDetails
                :key="row.getValue<Item>('item').id"
                :name="row.getValue<Item>('item').name || ''"
                :image="row.getValue<Item>('item').meta?.image || ''"
                :collection-name="row.getValue<Item>('item').collection.name || ''"
              />
            </nuxt-link>
          </div>
        </div>
      </template>

      <template #type-cell="{ row }">
        <EventTag
          :interaction="row.getValue('type')"
          :interaction-name="(interactionNameMap({ distinguishBuyAndSell: true }) as Record<string, string>)[row.getValue('type') as string] || ''"
          distinguish-buy-and-sell
        />
      </template>

      <template #from-cell="{ row }">
        <UserInfo
          v-if="row.getValue('from')"
          :address="row.getValue('from') || ''"
          :avatar-size="20"
          :transparent-background="true"
          class="!p-0"
        />
        <span v-else>{{ blank }} </span>
      </template>

      <template #to-cell="{ row }">
        <UserInfo
          v-if="row.getValue('to')"
          :address="row.getValue('to') || ''"
          :avatar-size="20"
          :transparent-background="true"
          class="!p-0"
        />
        <span v-else>{{ blank }} </span>
      </template>

      <template #amount-cell="{ row }">
        <Money :value="row.getValue('amount')" inline />
      </template>
    </UTable>
  </div>
</template>
