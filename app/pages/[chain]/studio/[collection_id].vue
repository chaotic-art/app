<script setup lang="ts">
import type { StudioCollectionData } from '~/composables/studio/useStudioCollection'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { CHAINS } from '@kodadot1/static'
import { provideStudioCollection } from '~/composables/studio/useStudioCollection'
import { useStudioKeyboard } from '~/composables/studio/useStudioKeyboard'
import { fetchOdaCollection } from '~/services/oda'

definePageMeta({
  layout: 'studio',
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && chain in CHAINS
  },
})

const route = useRoute()
const { chain: chainPrefix, collection_id } = route.params

const chain = computed(() => chainPrefix as AssetHubChain)
const collectionId = computed(() => collection_id?.toString() ?? '')
const isMock = computed(() => route.query.mock === 'true')

const { data } = await useLazyAsyncData(
  `studio:${chain.value}:${collectionId.value}`,
  () => fetchOdaCollection(chain.value, collectionId.value),
)

const mockCollectionData: Omit<StudioCollectionData, 'id' | 'chain'> = {
  name: 'Cosmic Explorers',
  description: 'A generative art collection exploring the boundaries of digital space. Each piece is a unique composition of cosmic patterns and ethereal forms.',
  image: '',
  banner: '',
  owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  supply: '200',
  claimed: '47',
  floor: 1500000000,
}

const collectionData = computed<StudioCollectionData>(() => {
  const fetched = data.value
  if (isMock.value && !fetched?.metadata?.name) {
    return {
      id: collectionId.value,
      chain: chain.value,
      ...mockCollectionData,
    }
  }
  return {
    id: collectionId.value,
    chain: chain.value,
    name: fetched?.metadata?.name || `Collection #${collectionId.value}`,
    description: fetched?.metadata?.description || '',
    image: fetched?.metadata?.image || '',
    banner: fetched?.metadata?.banner || fetched?.metadata?.image || '',
    owner: fetched?.owner || '',
    supply: fetched?.supply || '0',
    claimed: fetched?.claimed || '0',
    floor: fetched?.floor ?? null,
  }
})

provideStudioCollection(collectionData)

const { showOverlay } = useStudioKeyboard()

const queryString = computed(() => {
  const q = new URLSearchParams(route.query as Record<string, string>).toString()
  return q ? `?${q}` : ''
})

const dashboardLink = computed(() =>
  `/${chainPrefix}/studio${queryString.value}`,
)

const studioRoot = computed(() =>
  `/${chainPrefix}/studio/${collection_id}${queryString.value}`,
)

const viewCollectionLink = computed(() =>
  `/${chainPrefix}/collection/${collection_id}${queryString.value}`,
)

// Breadcrumb: detect current sub-page from route
const subPageLabel = computed(() => {
  const path = route.path
  const base = `/${chainPrefix}/studio/${collection_id}`
  const suffix = path.slice(base.length).replace(/^\//, '')
  const labels: Record<string, string> = {
    preview: 'Preview',
    details: 'Details',
    massmint: 'Mass Mint',
    list: 'List',
    transfer: 'Transfer',
    airdrop: 'Airdrop',
  }
  return labels[suffix] || ''
})

const isOnSubPage = computed(() => !!subPageLabel.value)

// Back button: one level up
const backTarget = computed(() =>
  isOnSubPage.value ? studioRoot.value : dashboardLink.value,
)

useSeoMeta({
  title: () => `Studio — ${collectionData.value.name}`,
})
</script>

<template>
  <div class="w-full">
    <div class="flex flex-col h-screen w-full">
      <!-- Top Bar -->
      <header class="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border bg-background">
        <div class="flex items-center gap-3 min-w-0">
          <NuxtLink
            :to="backTarget"
            class="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <UIcon name="i-heroicons-chevron-left" class="w-5 h-5" />
          </NuxtLink>
          <nav class="flex items-center gap-1.5 text-sm min-w-0">
            <NuxtLink :to="dashboardLink" class="text-muted-foreground hover:text-foreground transition-colors">
              collections
            </NuxtLink>
            <span class="text-muted-foreground">/</span>
            <NuxtLink
              v-if="isOnSubPage"
              :to="studioRoot"
              class="text-muted-foreground hover:text-foreground transition-colors truncate"
            >
              {{ collectionData.name }}
            </NuxtLink>
            <span v-else class="font-semibold truncate">{{ collectionData.name }}</span>
            <template v-if="isOnSubPage">
              <span class="text-muted-foreground">/</span>
              <span class="font-semibold truncate">{{ subPageLabel }}</span>
            </template>
          </nav>
        </div>
        <NuxtLink
          :to="viewCollectionLink"
          class="flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-muted/60 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
        >
          Close
        </NuxtLink>
      </header>

      <!-- Sidebar + Content -->
      <div class="flex flex-1 min-h-0">
        <StudioSidebar
          :collection="collectionData"
        />
        <main class="flex-1 min-w-0 overflow-y-auto">
          <NuxtPage />
        </main>
      </div>
    </div>

    <StudioKeyboardOverlay
      :open="showOverlay"
      @close="showOverlay = false"
    />
  </div>
</template>
