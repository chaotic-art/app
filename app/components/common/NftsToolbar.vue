<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'
import type { SortQueryValue } from '~/utils/sort'
import { STICKY_MOBILE_TOOLBAR_ROW_CLASS, STICKY_MOBILE_TOOLBAR_SEARCH_CLASS } from '~/utils/exploreToolbar'
import { getSingleQueryValue } from '~/utils/query'

interface QueryState {
  sortKeys: string[]
  search: string
  listed: { label: string, value: string, disabled?: boolean }
  owned: boolean
}

const props = withDefaults(defineProps<{
  extraVariables?: Record<string, any>
  hasOwnedFilter?: boolean
  stickySearchOnly?: boolean
}>(), {
  extraVariables: () => ({}),
  stickySearchOnly: false,
})

const emit = defineEmits<{
  'update:queryVariables': [value: any]
}>()

const route = useRoute()
const router = useRouter()
const { accountId } = useAuth()
const { t } = useI18n()
const {
  sortOptions,
  normalizeSortKeys,
  buildOrderBy,
  requiresListed,
  applySortQuery,
} = useSortOptions('exploreNfts')

const listedOptions = computed(() => {
  const unlistedDisabled = requiresListed(route.query.sort)

  return [
    { label: 'All', value: '' },
    { label: 'Listed', value: 'true' },
    { label: 'Unlisted', value: 'false', disabled: unlistedDisabled },
  ]
})

const queryState = computed({
  get: () => {
    const sortKeys = normalizeSortKeys(route.query.sort)
    const listedFromQuery = listedOptions.value.find(opt => opt.value === getSingleQueryValue(route.query.listed)) || listedOptions.value[0] as QueryState['listed']
    const listed = requiresListed(sortKeys)
      ? listedOptions.value.find(opt => opt.value === 'true') || listedOptions.value[0] as QueryState['listed']
      : listedFromQuery

    return {
      sortKeys,
      search: getSingleQueryValue(route.query.search),
      listed,
      owned: getSingleQueryValue(route.query.owned) === 'true',
    }
  },
  set: ({ sortKeys, search, listed, owned }: { sortKeys?: string[], search?: string, listed?: QueryState['listed'], owned?: boolean }) => {
    const query: LocationQueryRaw = { ...route.query }
    const nextSortKeys = applySortQuery(query, sortKeys ?? route.query.sort)
    const listedValue = requiresListed(nextSortKeys) ? 'true' : listed?.value

    if (!search) {
      delete query.search
    }
    else {
      query.search = search
    }

    if (listedValue) {
      query.listed = listedValue
    }
    else {
      delete query.listed
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

  // If listed was only auto-forced by a price sort, reset back to All when leaving price sorts.
  if (updates.sortKeys && !updates.listed) {
    const currentSortRequiresListed = requiresListed(currentState.sortKeys)
    const nextSortRequiresListed = requiresListed(nextState.sortKeys)

    if (currentSortRequiresListed && !nextSortRequiresListed) {
      nextState.listed = listedOptions.value.find(opt => opt.value === '') || listedOptions.value[0] as QueryState['listed']
    }
  }

  queryState.value = nextState
}

function computeQueryVariables(state: QueryState) {
  const selectedSortKeys = state.sortKeys
  const orderBy = buildOrderBy(selectedSortKeys)
  const search = state.search
  const listedVariables: Record<string, unknown> = {}
  const listedValue = state.listed?.value
  const sortRequiresListed = requiresListed(selectedSortKeys)

  if (sortRequiresListed || listedValue === 'true') {
    listedVariables.search = { price_gt: '0' }
  }
  else if (listedValue === 'false') {
    listedVariables.price_isNull = true
  }

  const ownedVariables = props.hasOwnedFilter && state.owned && accountId.value
    ? { owner: accountId.value }
    : {}

  return {
    ...props.extraVariables,
    orderBy,
    ...(search && { name: search }),
    ...listedVariables,
    ...ownedVariables,
  }
}

function handleSortKeysUpdate(value: SortQueryValue) {
  const nextSortKeys = normalizeSortKeys(value)
  updateQueryState({ sortKeys: nextSortKeys })
}

watch(() => queryState.value, (newValue) => {
  const queryVariables = computeQueryVariables(newValue)
  emit('update:queryVariables', queryVariables)
}, { immediate: true, deep: true })
</script>

<template>
  <div
    class="flex items-center gap-2"
    :class="props.stickySearchOnly ? STICKY_MOBILE_TOOLBAR_ROW_CLASS : 'flex-wrap'"
  >
    <ChainSwitcher
      :show-label="!props.stickySearchOnly"
      :compact="props.stickySearchOnly"
    />

    <UInput
      :model-value="queryState.search"
      placeholder="Search NFTs..."
      :class="props.stickySearchOnly ? STICKY_MOBILE_TOOLBAR_SEARCH_CLASS : 'w-48'"
      icon="i-heroicons-magnifying-glass"
      @update:model-value="updateQueryState({ search: $event })"
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
    </template>
  </div>
</template>
