<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'
import type { SelectedTrait } from '@/components/trait/types'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { CHAINS } from '@kodadot1/static'
import { TradeTypes } from '@/components/trade/types'
import { fetchOdaCollection } from '~/services/oda'
import { normalizeRarityTotalItems } from '~/types/rarity'

const availableTabs = ['items', 'offers', 'swaps', 'traits', 'analytics'] as const
type CollectionTab = typeof availableTabs[number]

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { chain: chainPrefix, collection_id } = route.params
const { isCurrentAccount, isLogIn } = useAuth()
const {
  sortOptions,
  normalizeSortKeys,
  buildOrderBy,
  requiresListed,
  applySortQuery,
} = useSortOptions('collectionItems')

const tabsItems = computed(() => [
  {
    label: 'Items',
    name: 'Items',
    slot: 'items',
    value: 'items',
  },
  {
    label: 'Offers',
    name: 'Offers',
    slot: 'offers',
    value: 'offers',
  },
  {
    label: 'Swaps',
    name: 'Swaps',
    slot: 'swaps',
    value: 'swaps',
  },
  {
    label: 'Traits',
    name: 'Traits',
    slot: 'traits',
    value: 'traits',
  },
  {
    label: t('analytics.tabs.analytics'),
    name: t('analytics.tabs.analytics'),
    slot: 'analytics',
    value: 'analytics',
  },
])

const activeTab = computed({
  get() {
    const tab = route.query.tab?.toString()
    return (availableTabs.includes(tab as CollectionTab) ? tab : 'items') as CollectionTab
  },
  set(tab: string) {
    router.replace({
      query: { ...route.query, tab },
    })
  },
})

const chain = computed(() => chainPrefix as AssetHubChain)
const { data } = await useLazyAsyncData(
  `collection:${chain.value}:${collection_id}`,
  async () => {
    const [collection, drops] = await Promise.all([
      fetchOdaCollection(chain.value, collection_id?.toString() ?? ''),
      $fetch('/api/genart/list', { query: { collection: collection_id?.toString() ?? '' } }),
    ])

    return { collection, drops }
  },
)

const collectionName = computed(() => data.value?.collection?.metadata?.name)
const collectionRarityTotalItems = computed(() => {
  return normalizeRarityTotalItems(data.value?.collection?.supply)
})

const selectedSortKeys = computed({
  get: () => normalizeSortKeys(route.query.sort),
  set: (value: string[]) => {
    const query: LocationQueryRaw = { ...route.query }
    applySortQuery(query, value)

    router.replace({ query })
  },
})

const filteredNftIds = ref<string[]>([])
const selectedTraits = ref<SelectedTrait[]>([])
const isCollectionFiltersOpen = ref(false)
const { viewMode: nftViewMode, gridClass: nftGridClass } = useNftViewMode('collection')

const gridKey = computed(() => {
  const serializedQuery = serializeQueryForKey(route.query, NFT_GRID_NON_FETCH_QUERY_KEYS)

  return [
    selectedSortKeys.value.join(','),
    filteredNftIds.value.join(','),
    serializedQuery,
  ].join('::')
})

const queryVariables = computed(() => {
  const baseVariables: Record<string, unknown> = {
    collections: [collection_id?.toString() ?? ''],
    orderBy: buildOrderBy(selectedSortKeys.value),
  }

  const searchFilters: Record<string, unknown>[] = []

  if (selectedTraits.value.length > 0) {
    searchFilters.push({ id_in: filteredNftIds.value })
  }

  const nftFilters = buildNftSearchFilters({ query: route.query })
  searchFilters.push(...nftFilters)

  if (requiresListed(selectedSortKeys.value)) {
    const hasPriceConstraint = searchFilters.some(
      filter => Object.hasOwn(filter, 'price_gt') || Object.hasOwn(filter, 'price_gte'),
    )

    if (!hasPriceConstraint) {
      searchFilters.unshift({ price_gt: '0' })
    }
  }

  if (searchFilters.length > 0) {
    return {
      ...baseVariables,
      search: searchFilters,
    }
  }

  return baseVariables
})

const isOwner = computed(() => {
  const owner = data.value?.drops?.data[0]?.creator || data.value?.collection?.owner
  return isLogIn.value && owner && isCurrentAccount(owner)
})

const overlay = useOverlay()
const destroyCollectionModal = overlay.create(defineAsyncComponent(() => import('@/components/DestroyCollectionModal.vue')))

function handleDestroyCollection() {
  destroyCollectionModal.open({
    collectionId: collection_id?.toString() ?? '',
    collectionName: collectionName.value,
    chain: chain.value,
  })
}

function handleNftIdsUpdate(nftIds: string[]) {
  filteredNftIds.value = nftIds
}

function handleSelectedTraitsUpdate(traits: SelectedTrait[]) {
  selectedTraits.value = traits
}

definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && chain in CHAINS
  },
})

useSeoMeta({
  title: () => collectionName.value,
  description: () => data.value?.collection?.metadata?.description?.slice(0, 150),
})

defineOgImageComponent('Frame', {
  title: collectionName.value,
  image: sanitizeIpfsUrl(data.value?.collection?.metadata?.image),
  items: data.value?.collection?.supply,
  claimed: data.value?.collection?.claimed,
  network: chain.value,
})
</script>

<template>
  <UContainer class="px-4 md:px-6 pb-6">
    <div>
      <CollectionHeader
        :collection="data?.collection ?? null"
        :collection-id="collection_id?.toString() ?? ''"
        :chain="chain"
        :creator="data?.drops?.data[0]?.creator"
        :drop-alias="data?.drops?.data[0]?.alias"
        :show-delete-button="true"
        :is-owner="Boolean(isOwner)"
        @delete="handleDestroyCollection"
      />

      <USeparator class="my-12" />

      <UTabs v-model="activeTab" color="neutral" :items="tabsItems" class="w-full" :ui="{ root: 'gap-4' }">
        <template #items>
          <!-- Items Section -->
          <ExploreFilters
            v-model:modal-open="isCollectionFiltersOpen"
            class="mt-2"
            filter-scope="collection"
            :collection-id="collection_id?.toString() ?? ''"
            :show-mobile-trigger="false"
            @update:nft-ids="handleNftIdsUpdate"
            @update:selected-traits="handleSelectedTraitsUpdate"
          >
            <div class="space-y-6">
              <StickyToolbarWrapper
                row-class="flex flex-row items-center justify-between gap-3 md:gap-4"
              >
                <div class="w-auto flex items-center justify-start">
                  <ExploreFilterToggleButton
                    v-model:mobile-modal-open="isCollectionFiltersOpen"
                    filter-scope="collection"
                  />
                </div>

                <div class="w-auto flex items-center gap-2 ml-auto">
                  <SortOptions
                    v-model="selectedSortKeys"
                    :options="sortOptions"
                    class="w-40"
                  />
                  <NftViewModeSelector scope="collection" />
                </div>
              </StickyToolbarWrapper>

              <!-- Items Grid -->
              <LazyNftsGrid
                :key="gridKey"
                :variables="queryVariables"
                :grid-class="nftGridClass"
                :view-mode="nftViewMode"
                no-items-found-message="This collection doesn't have any items yet."
                :prefix="chain"
                :rarity-total-items="collectionRarityTotalItems"
                show-rarity
              />
            </div>
          </ExploreFilters>
        </template>
        <template #offers>
          <CollectionTrades :trade-type="TradeTypes.Offer" />
        </template>
        <template #swaps>
          <CollectionTrades :trade-type="TradeTypes.Swap" />
        </template>
        <template #traits>
          <TraitOverview :collection-id="collection_id?.toString() ?? ''" :collection-name="collectionName" />
        </template>
        <template #analytics>
          <CollectionAnalytics
            :collection-id="collection_id?.toString() ?? ''"
            :collection-name="collectionName"
            :floor-price="data?.collection?.floor"
            :owners-count="data?.collection?.uniqueOwnersCount ?? null"
          />
        </template>
      </UTabs>
    </div>
    <ScrollToTop />
  </UContainer>
</template>
