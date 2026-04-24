<script setup lang="ts">
import type { EventInteraction } from './types'
import type { AssetHubChain } from '~/types'
import { sortBy } from 'lodash'
import { allEvents } from '~/graphql/queries/profiles'

const props = defineProps<{
  address?: string
  collectionId?: string
}>()
const emit = defineEmits(['totalCountChange'])

const route = useRoute()
const router = useRouter()
const { $apolloClient } = useNuxtApp()
const { currentChain } = useChain()
const loading = ref(true)
const events = ref<EventInteraction[]>([])

const isProfileScope = computed(() => Boolean(props.address))
const filters = computed(() => isProfileScope.value
  ? ['sale', 'buy', 'mint', 'transfer', 'list']
  : ['sale', 'mint', 'transfer', 'list'])

const activeFilters = computed(() =>
  filters.value.filter(queryParam => route.query[queryParam] === 'true'),
)

const interactionToFilterMap = {
  MINT: 'mint',
  MINTNFT: 'mint',
  LIST: 'list',
  SEND: 'transfer',
}

const scopeId = computed(() => props.address || props.collectionId || '')
const where = computed(() => {
  if (props.address) {
    return {
      OR: [
        { caller_eq: props.address },
        { currentOwner_eq: props.address },
      ],
    }
  }

  if (props.collectionId) {
    return {
      nft: {
        collection: {
          id_eq: props.collectionId,
        },
      },
    }
  }

  return undefined
})

const filteredEvents = computed(() =>
  events.value.filter(({ interaction, caller }) => {
    if (interaction === 'BUY') {
      if (!isProfileScope.value) {
        return activeFilters.value.includes('sale')
      }

      return activeFilters.value.includes(caller === props.address ? 'buy' : 'sale')
    }
    return activeFilters.value.includes(interactionToFilterMap[interaction as keyof typeof interactionToFilterMap])
  }),
)

function selectAll() {
  router.replace({
    query: {
      ...route.query,
      ...filters.value.reduce((acc, filter) => {
        Object.assign(acc, { [filter]: true })
        return acc
      }, {}),
    },
  })
}

async function fetchProfileActivity(endpoint: AssetHubChain) {
  const response = await $apolloClient.query({
    query: allEvents,
    variables: {
      where: where.value,
    },
    context: {
      endpoint,
    },
  })

  events.value = sortBy(response.data.events, 'timestamp')
  loading.value = false
}

onMounted(async () => {
  if (!scopeId.value) {
    return
  }

  if (!activeFilters.value.length) {
    router.replace({
      query: {
        ...route.query,
        sale: String(true),
        ...(isProfileScope.value ? { buy: String(true) } : {}),
      },
    })
  }

  await fetchProfileActivity(currentChain.value as AssetHubChain)

  emit('totalCountChange', events.value.length)
})
</script>

<template>
  <div class="my-4">
    <ProfileActivityTable :loading="loading" :events="filteredEvents" :address="address" :distinguish-buy-and-sell="isProfileScope">
      <div class="flex gap-3">
        <UButton
          variant="ghost"
          label="All"
          @click="selectAll"
        />

        <FilterButton
          v-for="filter in filters"
          :key="filter"
          class="capitalize"
          variant="outline"
          :url-param="filter"
          :label="filter"
        />
      </div>
    </ProfileActivityTable>
  </div>
</template>
