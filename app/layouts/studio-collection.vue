<script setup lang="ts">
import type { StudioNavItem } from '@/components/studio/StudioSidebar.vue'

useSeoMeta({
  title: 'Manage Collection - Studio',
  description: 'Manage your NFT collection.',
})

const route = useRoute()
const router = useRouter()
const { currentChain } = useChain()

const validTabs = ['preview', 'details', 'items'] as const
const collectionId = computed(() => route.params.collection_id as string)
const { collection } = useOdaCollection(collectionId)

const currentTab = computed(() => {
  const tab = route.params.tab as string
  return validTabs.includes(tab as (typeof validTabs)[number])
    ? (tab as (typeof validTabs)[number])
    : ''
})

const collectionName = computed(() => collection.value?.metadata?.name ?? 'Collection')
const collectionImage = computed(() => collection.value?.metadata?.image)
const itemCount = computed(() => collection.value?.claimed ?? '0')
const studioIndexPath = computed(() => `/${currentChain.value}/studio`)
const collectionPagePath = computed(() => `/${currentChain.value}/collection/${collectionId.value}`)
const massMintPath = computed(() => `/${currentChain.value}/studio/${collectionId.value}/massmint`)

const overlay = useOverlay()
const destroyCollectionModal = overlay.create(defineAsyncComponent(() => import('@/components/DestroyCollectionModal.vue')))

function handleDestroyCollection() {
  destroyCollectionModal.open({
    collectionId: collectionId.value,
    collectionName: collectionName.value,
    chain: currentChain.value,
  })
}

const overlay = useOverlay()
const destroyCollectionModal = overlay.create(defineAsyncComponent(() => import('@/components/DestroyCollectionModal.vue')))

function handleDestroyCollection() {
  destroyCollectionModal.open({
    collectionId: collectionId.value,
    collectionName: collectionName.value,
    chain: currentChain.value,
  })
}

// TODO: Add relevant nav items pages
const navItems: StudioNavItem[] = [
  // { id: 'preview' as const, label: 'Preview', icon: 'i-heroicons:eye' },
  // { id: 'details' as const, label: 'Details', icon: 'i-heroicons-cog-6-tooth' },
  // { id: 'items' as const, label: 'Items', icon: 'i-heroicons-squares-2x2' },
]

function setTab(tab: (typeof validTabs)[number]) {
  router.push({
    path: `/${currentChain.value}/studio/${collectionId.value}/${tab}`,
    query: route.query,
  })
}
</script>

<template>
  <div class="h-screen flex flex-col bg-background overflow-hidden">
    <StudioHeader
      :studio-index-path="studioIndexPath"
      :collection-name="collectionName"
      :current-tab="currentTab"
    />

    <div class="flex flex-1 min-h-0">
      <StudioSidebar
        :collection-name="collectionName"
        :collection-image="collectionImage"
        :item-count="itemCount"
        :current-tab="currentTab"
        :nav-items="navItems"
        :collection-page-path="collectionPagePath"
        :mass-mint-path="massMintPath"
        @select-tab="(tab) => setTab(tab as (typeof validTabs)[number])"
        @delete-collection="handleDestroyCollection"
      />

      <main class="flex-1 min-w-0 overflow-auto p-6 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
