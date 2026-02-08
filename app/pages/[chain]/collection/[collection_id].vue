<script setup lang="ts">
import type { SelectedTrait } from '@/components/trait/types'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { CHAINS } from '@kodadot1/static'
import { TradeTypes } from '@/components/trade/types'
import { useSortOptions } from '~/composables/useSortOptions'
import { fetchOdaCollection } from '~/services/oda'
import { getSubscanAccountUrl } from '~/utils/format/address'

const route = useRoute()
const router = useRouter()
const { chain: chainPrefix, collection_id } = route.params
const { isCurrentAccount, isLogIn } = useAuth()

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
const bannerUrl = computed(() => toOriginalContentUrl(sanitizeIpfsUrl(data.value?.collection?.metadata?.banner || data.value?.collection?.metadata?.image)))

const { selectedSort, createQueryVariables } = useSortOptions()

const filteredNftIds = ref<string[]>([])
const selectedTraits = ref<SelectedTrait[]>([])

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

const isOwner = computed(() => {
  const owner = data.value?.drops?.data[0]?.creator || data.value?.collection?.owner
  return isLogIn.value && owner && isCurrentAccount(owner)
})

const overlay = useOverlay()
const destroyCollectionModal = overlay.create(defineAsyncComponent(() => import('@/components/DestroyCollectionModal.vue')))

function handleDestroyCollection() {
  destroyCollectionModal.open({
    collectionId: collection_id?.toString() ?? '',
    collectionName: data.value?.collection?.metadata?.name,
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
  title: () => data.value?.collection?.metadata?.name,
  description: () => data.value?.collection?.metadata?.description?.slice(0, 150),
})

defineOgImageComponent('Frame', {
  title: data.value?.collection?.metadata?.name,
  image: sanitizeIpfsUrl(data.value?.collection?.metadata?.image),
  items: data.value?.collection?.supply,
  claimed: data.value?.collection?.claimed,
  network: chain.value,
})
</script>

<template>
  <UContainer class="px-4 md:px-6 pb-6">
    <div>
      <!-- Banner Section -->
      <div class="relative w-full min-h-[340px] flex flex-col justify-end rounded-xl overflow-hidden">
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
                v-if="data?.collection?.metadata?.image"
                :src="sanitizeIpfsUrl(data.collection.metadata.image)"
                :alt="data.collection.metadata.name || 'Collection'"
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
                  {{ data?.collection?.metadata?.name || `Collection #${collection_id}` }}
                </div>
                <UButton
                  v-if="isOwner"
                  color="error"
                  variant="outline"
                  icon="i-heroicons-trash"
                  @click="handleDestroyCollection"
                >
                  Delete Collection
                </UButton>
              </div>
              <div v-if="data?.drops?.data[0]?.creator || data?.collection?.owner" class="flex items-center gap-1 text-muted-foreground">
                <UserInfo :avatar-size="26" :address="data?.drops?.data[0]?.creator || data?.collection?.owner" class="min-w-0" />
                <UButton
                  :to="getSubscanAccountUrl((data?.drops?.data[0]?.creator || data?.collection?.owner) ?? '', chain)"
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
                  View Drop: {{ data?.collection?.metadata?.name }}
                </UButton>
              </div>
            </div>

            <!-- Description -->
            <MarkdownPreview
              v-if="data?.collection?.metadata?.description"
              :source="data.collection.metadata.description"
            />
          </div>

          <!-- Quick Stats -->
          <div class="pt-4 w-auto md:w-60 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Minted</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ data?.collection?.claimed || 0 }} / {{ unlimited(data?.collection?.supply) ? '∞' : data?.collection?.supply || 0 }}</span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">Floor Price</span>
              <span class="font-medium text-gray-900 dark:text-white">
                <Money v-if="data?.collection?.floor" inline :value="data?.collection?.floor" />
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
          <ExploreFilters class="mt-2">
            <div class="space-y-6">
              <div class="flex flex-col md:flex-row justify-end items-center gap-4">
                <div class="w-full md:w-auto flex items-center gap-2">
                  <ArtViewFilter />
                  <TraitFilter
                    :collection-id="collection_id?.toString() ?? ''"
                    @update:nft-ids="handleNftIdsUpdate"
                    @update:selected-traits="handleSelectedTraitsUpdate"
                  />
                  <SortOptions
                    v-model="selectedSort"
                    class="w-full md:w-48"
                  />
                </div>
              </div>

              <!-- Items Grid -->
              <LazyNftsGrid
                :key="`${selectedSort}-${filteredNftIds.length}-${filteredNftIds.join(',')}-${JSON.stringify(queryVariables)}`"
                :variables="queryVariables"
                grid-class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6"
                no-items-found-message="This collection doesn't have any items yet."
                :prefix="chain"
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
          <TraitOverview :collection-id="collection_id?.toString() ?? ''" />
        </template>
      </UTabs>
    </div>
    <ScrollToTop />
  </UContainer>
</template>
