<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'
import type { ListedFilterMode } from '~/composables/useSearchFilters'
import type { SortQueryValue } from '~/utils/sort'
import { STICKY_MOBILE_TOOLBAR_ROW_CLASS, STICKY_MOBILE_TOOLBAR_SEARCH_CLASS } from '~/utils/exploreToolbar'
import { getSingleQueryValue } from '~/utils/query'

interface QueryState {
  sortKeys: string[]
  search: string
  owned: boolean
}

const props = withDefaults(defineProps<{
  extraVariables?: Record<string, any>
  hasOwnedFilter?: boolean
  hideChainSwitcher?: boolean
  stickySearchOnly?: boolean
}>(), {
  extraVariables: () => ({}),
  stickySearchOnly: false,
  hideChainSwitcher: false,
})

const emit = defineEmits<{
  'update:queryVariables': [value: any]
}>()

const route = useRoute()
const router = useRouter()
const { accountId } = useAuth()
const { t } = useI18n()
const { buildNftSearchConstraints } = useSearchFilters()
const { listedMode, resolveListedForSort } = useExploreNftStatusFilter()
const {
  sortOptions,
  normalizeSortKeys,
  buildOrderBy,
  resolveSortQuery,
} = useSortOptions('exploreNfts')

const queryState = computed({
  get: () => {
    const sortKeys = normalizeSortKeys(route.query.sort)

    return {
      sortKeys,
      search: getSingleQueryValue(route.query.search),
      owned: getSingleQueryValue(route.query.owned) === 'true',
    }
  },
  set: ({ sortKeys, search, owned }: { sortKeys?: string[], search?: string, owned?: boolean }) => {
    let query: LocationQueryRaw = { ...route.query }
    const currentSortKeys = normalizeSortKeys(route.query.sort)
    const nextSortState = resolveSortQuery(query, sortKeys ?? route.query.sort)
    const nextSortKeys = nextSortState.sortKeys

    query = resolveListedForSort(nextSortState.query, currentSortKeys, nextSortKeys)

    if (!search) {
      delete query.search
    }
    else {
      query.search = search
    }

    if (owned) {
      query.owned = owned.toString()
    }
    else {
      delete query.owned
    }

    router.push({ query })
  },
})

function updateQueryState(updates: Partial<QueryState>) {
  const currentState = queryState.value
  const nextState: QueryState = { ...currentState, ...updates }
  queryState.value = nextState
}

const { input: searchInput, onInput: handleSearchUpdate } = useDebouncedSyncedInput(
  computed(() => queryState.value.search),
  search => updateQueryState({ search }),
)

function computeQueryVariables(state: QueryState, activeListedMode: ListedFilterMode) {
  const selectedSortKeys = state.sortKeys
  const orderBy = buildOrderBy(selectedSortKeys)

  const searchConstraints = buildNftSearchConstraints({
    phrase: state.search,
    listedMode: activeListedMode,
  })

  const ownedVariables = props.hasOwnedFilter && state.owned && accountId.value
    ? { owner: accountId.value }
    : {}

  return {
    ...props.extraVariables,
    orderBy,
    ...searchConstraints,
    ...ownedVariables,
  }
}

function handleSortKeysUpdate(value: SortQueryValue) {
  const nextSortKeys = normalizeSortKeys(value)
  updateQueryState({ sortKeys: nextSortKeys })
}

const queryVariables = computed(() => computeQueryVariables(queryState.value, listedMode.value))

watch(queryVariables, (newValue) => {
  emit('update:queryVariables', newValue)
}, { immediate: true, deep: true })
</script>

<template>
  <div
    class="flex items-center gap-2"
    :class="props.stickySearchOnly ? STICKY_MOBILE_TOOLBAR_ROW_CLASS : 'flex-wrap'"
  >
    <ChainSwitcher
      v-if="!props.hideChainSwitcher"
      :show-label="!props.stickySearchOnly"
      :compact="props.stickySearchOnly"
    />

    <UInput
      :model-value="searchInput"
      placeholder="Search NFTs..."
      :class="props.stickySearchOnly ? STICKY_MOBILE_TOOLBAR_SEARCH_CLASS : 'w-48'"
      icon="i-heroicons-magnifying-glass"
      @update:model-value="handleSearchUpdate($event)"
    />

    <template v-if="!props.stickySearchOnly">
      <USelectMenu
        :model-value="queryState.sortKeys"
        :items="sortOptions"
        :placeholder="t('explore.sortBy')"
        class="w-40"
        :search-input="false"
        value-key="value"
        multiple
        :ui="{ content: 'min-w-50 max-h-80 overflow-y-auto' }"
        @update:model-value="handleSortKeysUpdate"
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
    </template>

    <slot name="trailing" />
  </div>
</template>
