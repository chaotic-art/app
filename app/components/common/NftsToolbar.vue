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
const { t } = useI18n()
const { sortOptions, defaultSortKey, normalizeSortKey, getSortDefinition } = useSortOptions('exploreNfts')

const listedOptions = [
  { label: 'All', value: '' },
  { label: 'Listed', value: 'true' },
  { label: 'Unlisted', value: 'false' },
]

const queryState = computed({
  get: () => ({
    sort: sortOptions.value.find(opt => opt.value === normalizeSortKey(route.query.sort)) || sortOptions.value[0] as QueryState['sort'],
    search: route.query.search as string || '',
    listed: listedOptions.find(opt => opt.value === route.query.listed) || listedOptions[0] as QueryState['listed'],
    owned: route.query.owned === 'true',
  }),
  set: ({ sort, search, listed, owned }: { sort?: QueryState['sort'], search?: string, listed?: QueryState['listed'], owned?: boolean }) => {
    const query = { ...route.query }
    const sortKey = sort?.value ? normalizeSortKey(sort.value) : normalizeSortKey(route.query.sort)

    if (sortKey === defaultSortKey)
      delete query.sort
    else
      query.sort = sortKey

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
  const sortKey = queryState.sort?.value || defaultSortKey
  const selectedSort = getSortDefinition(sortKey)
  const search = queryState.search
  const listedVariables: Record<string, unknown> = {}
  const listedValue = queryState.listed?.value

  if (listedValue === 'false') {
    listedVariables.price_isNull = true
  }
  else if (listedValue === 'true' || selectedSort.requiresListed) {
    listedVariables.search = { price_gt: '0' }
  }

  const ownedVariables = props.hasOwnedFilter && queryState.owned && accountId.value
    ? { owner: accountId.value }
    : {}

  return {
    ...props.extraVariables,
    orderBy: selectedSort.orderBy,
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
      :placeholder="t('explore.sortBy')"
      class="w-40"
      :search-input="false"
      :ui="{ content: 'min-w-50 max-h-80 overflow-y-auto' }"
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
