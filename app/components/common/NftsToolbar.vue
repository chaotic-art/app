<script setup lang="ts">
interface QueryState {
  sort: { label: string, value: string }
  search: string
  listed: { label: string, value: string }
}

const props = withDefaults(defineProps<{
  extraVariables?: Record<string, any>
}>(), {
  extraVariables: () => ({}),
})

const emit = defineEmits<{
  'update:queryVariables': [value: any]
}>()

const route = useRoute()
const router = useRouter()

const sortOptions = [
  { label: 'Recent', value: 'blockNumber_DESC' },
  { label: 'Oldest', value: 'blockNumber_ASC' },
  { label: 'A-Z', value: 'name_ASC' },
  { label: 'Z-A', value: 'name_DESC' },
]

const listedOptions = [
  { label: 'All', value: '' },
  { label: 'Listed', value: 'true' },
  { label: 'Unlisted', value: 'false' },
]

const queryState = computed({
  get: () => ({
    sort: sortOptions.find(opt => opt.value === route.query.sort) || sortOptions[0] as QueryState['sort'],
    search: route.query.search as string || '',
    listed: listedOptions.find(opt => opt.value === route.query.listed) || listedOptions[0] as QueryState['listed'],
  }),
  set: ({ sort, search, listed }: { sort?: QueryState['sort'], search?: string, listed?: QueryState['listed'] }) => {
    const query = { ...route.query }

    // Clean up default values
    if (sort?.value === 'blockNumber_DESC')
      delete query.sort
    else if (sort)
      query.sort = sort.value

    if (!search)
      delete query.search
    else query.search = search

    if (listed?.value)
      query.listed = listed.value
    else
      delete query.listed

    router.push({ query })
  },
})

function updateQueryState(updates: Partial<QueryState>) {
  queryState.value = { ...queryState.value, ...updates }

  const queryVariables = computeQueryVariables(queryState.value)
  emit('update:queryVariables', queryVariables)
}

function computeQueryVariables(queryState: QueryState) {
  const orderBy = queryState.sort?.value || 'blockNumber_DESC'
  const search = queryState.search
  const listedVariables
    = queryState.listed?.value === 'true'
      ? { search: { price_gt: 0 } }
      : queryState.listed?.value === 'false'
        ? { price_isNull: true }
        : {}

  return {
    ...props.extraVariables,
    orderBy: [orderBy],
    ...(search && { name: search }),
    ...listedVariables,
  }
}

// Watch for changes in queryState and emit updated queryVariables
watch(() => queryState.value, (newValue) => {
  const queryVariables = computeQueryVariables(newValue)
  emit('update:queryVariables', queryVariables)
}, { immediate: true, deep: true })
</script>

<template>
  <div class="flex items-center gap-2 flex-wrap">
    <UInput
      :model-value="queryState.search"
      placeholder="Search NFTs..."
      class="w-48"
      icon="i-heroicons-magnifying-glass"
      @update:model-value="updateQueryState({ search: $event })"
    />

    <USelectMenu
      :model-value="queryState.sort"
      :items="sortOptions"
      placeholder="Sort By"
      class="w-32"
      @update:model-value="updateQueryState({ sort: $event })"
    />

    <USelectMenu
      :model-value="queryState.listed"
      :items="listedOptions"
      placeholder="Listed"
      class="w-26"
      :search-input="false"
      @update:model-value="updateQueryState({ listed: $event })"
    />
  </div>
</template>
