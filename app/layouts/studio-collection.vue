<script setup lang="ts">
import type { StudioNavItem } from '@/components/studio/StudioSidebar.vue'
import type { AssetHubChain } from '~/types/chain'

useSeoMeta({
  title: 'Manage Collection - Studio',
  description: 'Manage your NFT collection.',
})

const route = useRoute()
const router = useRouter()
const chain = computed(() => route.params.chain as AssetHubChain)

const validTabs = ['preview', 'details', 'items', 'traits'] as const

const tabLabels: Record<string, string> = {
  massmint: 'Mass Mint',
  nftmint: 'Create NFT',
  preview: 'Preview',
  details: 'Details',
  items: 'Items',
  traits: 'Traits',
}

const collectionId = computed(() => route.params.collection_id as string)
const { collection } = useOdaCollection(collectionId)

const currentTabId = computed(() => {
  const pathSegment = route.path.split('/').filter(Boolean).pop()
  return pathSegment && tabLabels[pathSegment] ? pathSegment : ''
})

const currentTabLabel = computed(() => tabLabels[currentTabId.value] ?? currentTabId.value)

const collectionName = computed(() => collection.value?.metadata?.name ?? 'Collection')
const collectionImage = computed(() => collection.value?.metadata?.image)
const itemCount = computed(() => collection.value?.claimed ?? '0')
const studioIndexPath = computed(() => `/${chain.value}/studio`)
const collectionPagePath = computed(() => `/${chain.value}/collection/${collectionId.value}`)
const massMintPath = computed(() => `/${chain.value}/studio/${collectionId.value}/massmint`)
const nftMintPath = computed(() => `/${chain.value}/studio/${collectionId.value}/nftmint`)

const overlay = useOverlay()
const destroyCollectionModal = overlay.create(defineAsyncComponent(() => import('@/components/DestroyCollectionModal.vue')))

function handleDestroyCollection() {
  destroyCollectionModal.open({
    collectionId: collectionId.value,
    collectionName: collectionName.value,
    chain: chain.value,
  })
}

// TODO: Add relevant nav items pages
const navItems: StudioNavItem[] = [
  { id: 'preview' as const, label: 'Preview', icon: 'i-heroicons:eye' },
  { id: 'details' as const, label: 'Details', icon: 'i-heroicons-cog-6-tooth' },
  { id: 'items' as const, label: 'Items', icon: 'i-heroicons-squares-2x2' },
  { id: 'traits' as const, label: 'Traits', icon: 'i-heroicons-tag' },
]

function setTab(tab: (typeof validTabs)[number]) {
  router.push({
    path: `/${chain.value}/studio/${collectionId.value}/${tab}`,
    query: route.query,
  })
}
</script>

<template>
  <div class="h-screen flex flex-col bg-background overflow-hidden">
    <StudioHeader
      :studio-index-path="studioIndexPath"
      :collection-name="collectionName"
      :current-tab="currentTabLabel"
    />

    <div class="flex flex-1 min-h-0">
      <StudioSidebar
        :collection-name="collectionName"
        :collection-image="collectionImage"
        :item-count="itemCount"
        :current-tab="currentTabId"
        :nav-items="navItems"
        :collection-page-path="collectionPagePath"
        :mass-mint-path="massMintPath"
        :nft-mint-path="nftMintPath"
        @select-tab="(tab) => setTab(tab as (typeof validTabs)[number])"
        @delete-collection="handleDestroyCollection"
      />

      <main class="flex-1 min-w-0 overflow-auto p-6 md:p-8">
        <slot />
        <LazyActionCart />
        <ScrollToTop />
      </main>
    </div>
  </div>
</template>
