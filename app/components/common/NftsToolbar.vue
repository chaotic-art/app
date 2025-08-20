<script setup lang="ts">
interface QueryState {
  sort: { label: string, value: string }
  search: string
  listed: { label: string, value: string }
  owned: boolean
}

const props = withDefaults(defineProps<{
  extraVariables?: Record<string, any>
  hasOwnedFilter?: boolean
}>(), {
  extraVariables: () => ({}),
})

const emit = defineEmits<{
  'update:queryVariables': [value: any]
}>()

const route = useRoute()
const router = useRouter()
const { accountId } = useAuth()

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
    owned: route.query.owned === 'true',
  }),
  set: ({ sort, search, listed, owned }: { sort?: QueryState['sort'], search?: string, listed?: QueryState['listed'], owned?: boolean }) => {
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

    if (owned)
      query.owned = owned.toString()
    else
      delete query.owned

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

  const ownedVariables = props.hasOwnedFilter && queryState.owned && accountId.value
    ? { owner: accountId.value }
    : {}

  return {
    ...props.extraVariables,
    orderBy: [orderBy],
    ...(search && { name: search }),
    ...listedVariables,
    ...ownedVariables,
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
    <!-- Chain Switcher -->
    <ChainSwitcher />

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

    <UButton
      v-if="hasOwnedFilter"
      :variant="queryState.owned ? 'solid' : 'outline'"
      :color="queryState.owned ? 'primary' : 'neutral'"
      class="px-4 h-8"
      @click="updateQueryState({ owned: !queryState.owned })"
    >
      Owned
      <template #trailing>
        <UIcon v-if="queryState.owned" name="i-heroicons-check" />
      </template>
    </UButton>
  </div>
</template>
