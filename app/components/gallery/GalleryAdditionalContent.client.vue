<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ExploreNftsData } from '~/graphql/queries/explore'
import type { OdaChain, OdaToken, OnchainCollection } from '~/services/oda'
import type { AssetHubChain } from '~/types'
import { TradeTypes } from '@/components/trade/types'
import TokenCard from '~/components/common/card/TokenCard.client.vue'
import TokenActivity from '~/components/gallery/TokenActivity.vue'
import { exploreNfts } from '~/graphql/queries/explore'

interface Props {
  tokenData: OdaToken | null
  collection: OnchainCollection | null
  chain: OdaChain
  collectionId: string
  tokenId: string
  mimeType?: string
  canInteract?: boolean
}

interface PropertyRow {
  trait_type: string
  value: string
  rarity: number
}

interface RelatedToken {
  id: string
  tokenId: string
  collectionId: string
  image: string
  name: string
}

const props = defineProps<Props>()

const route = useRoute()
const router = useRouter()
const { $apolloClient } = useNuxtApp()
const assetHubChain = computed(() => getAssetHubChain(props.chain))
const moreFromCollection = ref<RelatedToken[]>([])

const { getAttributeRarity } = useCollectionAttributes({
  collectionId: computed(() => props.collectionId),
})

const properties = computed<PropertyRow[]>(() => {
  const attributes = (props.tokenData?.metadata?.attributes || []) as Array<Record<string, string>>

  return attributes.map((attr) => {
    const traitType = attr.trait_type || attr.trait || attr.key || ''
    const traitValue = attr.value || ''
    const rarity = getAttributeRarity(traitType, traitValue)

    return {
      trait_type: traitType,
      value: traitValue,
      rarity,
    }
  })
})

const propertiesColumns: TableColumn<PropertyRow>[] = [
  {
    accessorKey: 'trait_type',
    header: 'Trait',
  },
  {
    accessorKey: 'value',
    header: 'Value',
  },
  {
    accessorKey: 'rarity',
    header: 'Rarity',
    cell: ({ row }) => {
      return `${row.original.rarity}%`
    },
  },
]

const tabsItems = computed(() => [
  {
    label: 'Activity',
    name: 'Activity',
    slot: 'activity',
    value: 'activity',
  },
  ...(props.canInteract
    ? [
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
      ]
    : []),
  {
    label: 'Properties',
    name: 'Properties',
    slot: 'properties',
    value: 'properties',
  },
])

const activeTab = computed({
  get() {
    const visibleTabs = tabsItems.value.map(item => item.value)
    const tab = route.query.tab as string | undefined
    return tab && visibleTabs.includes(tab) ? tab : 'activity'
  },
  set(tab) {
    router.replace({
      query: { ...route.query, tab },
    })
  },
})

async function fetchMoreFromCollection(endpoint: AssetHubChain) {
  try {
    const { data } = await $apolloClient.query<ExploreNftsData>({
      query: exploreNfts,
      variables: {
        first: 6,
        collections: [props.collectionId],
        orderBy: ['blockNumber_DESC', 'sn_DESC'],
        search: [{ id_not_eq: `${props.collectionId}-${props.tokenId}` }],
      },
      context: {
        endpoint,
      },
    })

    moreFromCollection.value = data.tokenEntities.map((nft) => {
      const [collectionId = '', tokenId = ''] = String(nft.id).split('-')

      return {
        id: nft.id,
        collectionId,
        tokenId,
        image: nft.meta?.image || nft.image || '',
        name: nft.name || 'Untitled NFT',
      }
    })
  }
  catch (error) {
    console.error('Failed to fetch more from collection:', error)
  }
}

onMounted(async () => {
  if (!assetHubChain.value) {
    return
  }

  fetchMoreFromCollection(assetHubChain.value)
})
</script>

<template>
  <!-- Additional Content -->
  <div class="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 py-12 my-12">
    <UContainer class="space-y-6">
      <!-- Item Activity and Token Details Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        <!-- Item Activity (3/5) -->
        <div class="lg:col-span-3">
          <UTabs v-model="activeTab" :items="tabsItems" :ui="{ root: 'gap-6' }" size="sm">
            <template #activity>
              <TokenActivity
                v-if="assetHubChain"
                :chain="assetHubChain"
                :collection-id="collectionId"
                :token-id="tokenId"
              />
            </template>
            <template v-if="canInteract" #offers>
              <TokenTrades
                v-if="assetHubChain"
                :chain="assetHubChain"
                :collection-id="collectionId"
                :token-id="tokenId"
                :type="TradeTypes.Offer"
              />
            </template>
            <template v-if="canInteract" #swaps>
              <TokenTrades
                v-if="assetHubChain"
                :chain="assetHubChain"
                :collection-id="collectionId"
                :token-id="tokenId"
                :type="TradeTypes.Swap"
              />
            </template>
            <template #properties>
              <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <UTable
                  v-if="properties.length"
                  :data="properties"
                  :columns="propertiesColumns"
                />
                <div v-else class="p-8 text-center text-muted-foreground">
                  No properties available for this NFT
                </div>
              </div>
            </template>
          </UTabs>
        </div>

        <!-- Token Details (2/5) -->
        <div class="lg:col-span-2">
          <div class="space-y-6">
            <h2 class="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              Token Details
            </h2>

            <div class="space-y-4">
              <!-- Properties Card -->
              <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
                <div class="space-y-4">
                  <!-- Chain -->
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-muted-foreground">Chain</span>
                    <span class="text-sm font-medium capitalize">{{ chainConfig[chain].name }}</span>
                  </div>

                  <!-- Token ID -->
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-muted-foreground">Token ID</span>
                    <span class="text-sm font-mono font-medium">{{ tokenId }}</span>
                  </div>

                  <!-- Collection -->
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-muted-foreground">Collection</span>
                    <span class="text-sm font-mono font-medium">{{ collectionId }}</span>
                  </div>

                  <!-- Media Type -->
                  <div v-if="mimeType" class="flex justify-between items-center">
                    <span class="text-sm text-muted-foreground">Media Type</span>
                    <span class="text-sm font-mono font-medium">{{ mimeType }}</span>
                  </div>

                  <!-- Image -->
                  <div v-if="sanitizeIpfsUrl(tokenData?.metadata?.image)" class="flex justify-between items-center">
                    <span class="text-sm text-muted-foreground">Image</span>
                    <NuxtLink
                      :to="sanitizeIpfsUrl(tokenData?.metadata?.image)" target="_blank"
                      class="text-sm font-mono font-medium text-foreground hover:text-muted-foreground transition-colors inline-flex items-center gap-1"
                    >
                      View
                      <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3" />
                    </NuxtLink>
                  </div>

                  <!-- Animation URL -->
                  <div v-if="sanitizeIpfsUrl(tokenData?.metadata?.animation_url)" class="flex justify-between items-center">
                    <span class="text-sm text-muted-foreground">Animation</span>
                    <NuxtLink
                      :to="sanitizeIpfsUrl(tokenData?.metadata?.animation_url)" target="_blank"
                      class="text-sm font-mono font-medium text-foreground hover:text-muted-foreground transition-colors inline-flex items-center gap-1"
                    >
                      View
                      <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3" />
                    </NuxtLink>
                  </div>

                  <!-- Metadata URI -->
                  <div v-if="sanitizeIpfsUrl(tokenData?.metadata_uri)" class="flex justify-between items-center">
                    <span class="text-sm text-muted-foreground">Metadata URI</span>
                    <NuxtLink
                      :to="sanitizeIpfsUrl(tokenData?.metadata_uri)" target="_blank"
                      class="text-sm font-mono font-medium text-foreground hover:text-muted-foreground transition-colors inline-flex items-center gap-1"
                    >
                      View
                      <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3" />
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- More from this collection -->
      <div v-if="moreFromCollection.length > 0">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              More from this collection
            </h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Discover other NFTs from {{ collection?.metadata?.name || `Collection ${collectionId}` }}
            </p>
          </div>

          <NuxtLink
            :to="`/${chain}/collection/${collectionId}`"
            class="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            View all
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <!-- Grid Layout -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          <TokenCard
            v-for="nft in moreFromCollection"
            :key="nft.id"
            :token-id="nft.tokenId"
            :collection-id="nft.collectionId"
            :chain="chain"
            :image="nft.image"
            :name="nft.name"
          />
        </div>
      </div>
    </UContainer>
  </div>
</template>
