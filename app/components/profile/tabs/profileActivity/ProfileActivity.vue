<script setup lang="ts">
import type { EventInteraction } from './types'
import { sortBy } from 'lodash'
import { allEventsByProfile } from '~/graphql/queries/profiles'

const props = defineProps<{
  address: string
}>()
const emit = defineEmits(['totalCountChange'])

const filters = ['sale', 'buy', 'mint', 'transfer', 'list']

const route = useRoute()
const router = useRouter()
const { $apolloClient } = useNuxtApp()
const loading = ref(true)
const events = ref<EventInteraction[]>([])

const activeFilters = computed(() =>
  filters.filter(queryParam => route.query[queryParam] === 'true'),
)

const interactionToFilterMap = {
  MINT: 'mint',
  MINTNFT: 'mint',
  LIST: 'list',
  SEND: 'transfer',
}

const filteredEvents = computed(() =>
  events.value.filter(({ interaction, caller }) => {
    if (interaction === 'BUY') {
      return activeFilters.value.includes(caller === props.address ? 'buy' : 'sale')
    }
    return activeFilters.value.includes(interactionToFilterMap[interaction as keyof typeof interactionToFilterMap])
  }),
)

function selectAll() {
  router.replace({
    query: {
      ...route.query,
      ...filters.reduce((acc, filter) => {
        Object.assign(acc, { [filter]: true })
        return acc
      }, {}),
    },
  })
}

async function fetchProfileActivity() {
  const response = await $apolloClient.query({
    query: allEventsByProfile,
    variables: {
      id: props.address,
    },
  })

  events.value = sortBy(response.data.events, 'timestamp')
  loading.value = false
}

onMounted(async () => {
  router.replace({
    query: {
      buy: String(true),
      sale: String(true),
    },
  })

  await fetchProfileActivity()

  emit('totalCountChange', events.value.length)
})
</script>

<template>
  <div class="my-4">
    <ProfileActivityTable :loading="loading" :events="filteredEvents" :address>
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
