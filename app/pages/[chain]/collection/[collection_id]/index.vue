<script setup lang="ts">
import type { SelectedTrait } from '@/components/trait/types'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { TradeTypes } from '@/components/trade/types'
import { useAdminSidebar } from '~/composables/collection/useAdminSidebar'
import { useSortOptions } from '~/composables/useSortOptions'
import { fetchOdaCollection } from '~/services/oda'
import { getSubscanAccountUrl } from '~/utils/format/address'

const route = useRoute()
const router = useRouter()
const { chain: chainPrefix, collection_id } = route.params
const { isCurrentAccount, isLogIn } = useAuth()

onMounted(() => {
  if (route.query.admin === 'true') {
    setPageLayout('no-footer')
  }
})

const {
  isOpen: sidebarOpen,
  selectionMode,
  selectedItemIds,
  sidebarView,
  selectedCount,
  toggleSelection,
  selectAll,
  clearSelection,
  toggleSelectionMode,
  closeItemDetail,
  closeSidebar: _closeSidebar,
  openSidebar: _openSidebar,
} = useAdminSidebar()

const tabsItems = ref([
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
])

const activeTab = computed({
  get() {
    return (route.query.tab as string) || 'items'
  },
  set(tab) {
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

const { selectedSort, createQueryVariables } = useSortOptions()

const filteredNftIds = ref<string[]>([])
const selectedTraits = ref<SelectedTrait[]>([])

const gridKey = computed(() => {
  const serializedQuery = serializeQueryForKey(route.query, NFT_GRID_NON_FETCH_QUERY_KEYS)

  return [
    selectedSort.value,
    filteredNftIds.value.join(','),
    serializedQuery,
  ].join('::')
})

const queryVariables = computed(() => {
  const baseVariables = createQueryVariables([collection_id?.toString() ?? ''])

  const searchFilters: Record<string, any>[] = []

  if (selectedTraits.value.length > 0) {
    searchFilters.push({ id_in: filteredNftIds.value })
  }

  const nftFilters = buildNftSearchFilters({ query: route.query })
  searchFilters.push(...nftFilters)

  if (searchFilters.length > 0) {
    return {
      ...baseVariables,
      search: searchFilters,
    }
  }

  return baseVariables
})

const isMock = computed(() => route.query.mock === 'true')

const collectionData = computed(() => data.value?.collection)

const collectionName = computed(() => collectionData.value?.metadata?.name)
const bannerUrl = computed(() => toOriginalContentUrl(sanitizeIpfsUrl(collectionData.value?.metadata?.banner || collectionData.value?.metadata?.image)))

const isOwner = computed(() => {
  const owner = data.value?.drops?.data[0]?.creator || data.value?.collection?.owner
  return isLogIn.value && owner && isCurrentAccount(owner)
})

function handleNftIdsUpdate(nftIds: string[]) {
  filteredNftIds.value = nftIds
}

function handleSelectedTraitsUpdate(traits: SelectedTrait[]) {
  selectedTraits.value = traits
}

function navigateToPage(path: string) {
  const mockQuery = isMock.value ? '?mock=true' : ''
  router.push(`${path}${mockQuery}`)
}

useSeoMeta({
  title: () => collectionName.value,
  description: () => collectionData.value?.metadata?.description?.slice(0, 150),
})

defineOgImageComponent('Frame', {
  title: collectionName.value,
  image: sanitizeIpfsUrl(collectionData.value?.metadata?.image),
  items: collectionData.value?.supply,
  claimed: collectionData.value?.claimed,
  network: chain.value,
})
</script>

<template>
  <UContainer class="px-4 md:px-6 pb-6">
    <!-- Mock mode indicator -->
    <div v-if="isMock" class="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 mb-4 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
      <UIcon name="i-heroicons-beaker" class="w-4 h-4 shrink-0" />
      <span>Mock mode — viewing with sample data. Admin sidebar and all features are enabled without a wallet.</span>
    </div>

    <div class="flex" :class="{ 'gap-6': sidebarOpen && isOwner }">
      <AdminSidebar
        v-if="isOwner"
        v-model:open="sidebarOpen"
        :collection-id="collection_id?.toString() ?? ''"
        :chain="chain"
        :collection-data="collectionData"
        :is-owner="!!isOwner"
        :sidebar-view="sidebarView"
        :selected-count="selectedCount"
        @toggle-selection="toggleSelectionMode"
        @select-all="selectAll([])"
        @clear-selection="clearSelection"
        @close-item-detail="closeItemDetail"
      />

      <div class="flex-1 min-w-0">
        <!-- Banner Section -->
        <div class="relative w-full min-h-[340px] flex flex-col justify-end rounded-xl overflow-hidden">
          <FloatingManageButton
            v-if="isOwner && !sidebarOpen"
            @click="navigateToPage(`/${chainPrefix}/studio/${collection_id}`)"
          />
          <div
            class="absolute inset-0 w-full h-full bg-muted"
            :style="bannerUrl ? {
              backgroundImage: `url('${bannerUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : {}"
          />

          <div class="relative flex items-center px-8 py-8 z-10">
            <div class="flex flex-col items-center">
              <div class="w-36 h-36 rounded-xl overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-4 border-white dark:border-gray-900 shadow-xl">
                <img
                  v-if="collectionData?.metadata?.image"
                  :src="sanitizeIpfsUrl(collectionData.metadata.image)"
                  :alt="collectionData.metadata.name || 'Collection'"
                  class="w-full h-full object-cover"
                >
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <UIcon name="i-heroicons-photo" class="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full">
          <div class="flex justify-between flex-col md:flex-row gap-12">
            <div class="flex flex-col flex-1">
              <div class="my-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-2xl font-bold">
                    {{ collectionData?.metadata?.name || `Collection #${collection_id}` }}
                  </div>
                </div>
                <div v-if="data?.drops?.data[0]?.creator || collectionData?.owner" class="flex items-center gap-1 text-muted-foreground">
                  <UserInfo :avatar-size="26" :address="data?.drops?.data[0]?.creator || collectionData?.owner" class="min-w-0" />
                  <UButton
                    :to="getSubscanAccountUrl((data?.drops?.data[0]?.creator || collectionData?.owner) ?? '', chain)"
                    target="_blank"
                    variant="outline"
                  >
                    Subscan
                  </UButton>
                  <UButton
                    v-if="data?.drops?.data[0]?.alias"
                    :to="`/${chain}/drops/${data.drops.data[0].alias}`"
                    icon="i-heroicons-sparkles"
                    variant="outline"
                  >
                    View Drop: {{ collectionData?.metadata?.name }}
                  </UButton>
                </div>
              </div>

              <!-- Description -->
              <MarkdownPreview
                v-if="collectionData?.metadata?.description"
                :source="collectionData.metadata.description"
              />
            </div>

            <!-- Quick Stats -->
            <div class="pt-4 w-auto md:w-60 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">Minted</span>
                <span class="font-medium font-mono text-gray-900 dark:text-white">{{ collectionData?.claimed || 0 }} / {{ unlimited(collectionData?.supply) ? '∞' : collectionData?.supply || 0 }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">Floor Price</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  <Money v-if="collectionData?.floor" inline :value="collectionData?.floor" />
                  <span v-else class="text-gray-400 dark:text-gray-500">–</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <USeparator class="my-12" />

        <UTabs v-model="activeTab" color="neutral" :items="tabsItems" class="w-full" :ui="{ root: 'gap-4' }">
          <template #items>
            <!-- Items Section -->
            <ExploreFilters
              class="mt-2"
              :collection-id="collection_id?.toString() ?? ''"
              @update:nft-ids="handleNftIdsUpdate"
              @update:selected-traits="handleSelectedTraitsUpdate"
            >
              <div class="space-y-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div class="w-full md:w-auto flex items-center justify-start">
                    <ExploreFilterToggleButton />
                  </div>

                  <div class="w-full md:w-auto flex items-center gap-2 md:ml-auto">
                    <ArtViewFilter />
                    <SortOptions
                      v-model="selectedSort"
                      class="w-full md:w-48"
                    />
                  </div>
                </div>

                <!-- Real Items Grid -->
                <LazyNftsGrid
                  :key="gridKey"
                  :variables="queryVariables"
                  grid-class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6"
                  no-items-found-message="This collection doesn't have any items yet."
                  :prefix="chain"
                  :selection-mode="selectionMode"
                  :selected-ids="selectedItemIds"
                  @select="(tokenId: number, collectionId: number) => toggleSelection(`${collectionId}-${tokenId}`)"
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
        </UTabs>
      </div>
    </div>
    <ScrollToTop />
  </UContainer>
</template>
