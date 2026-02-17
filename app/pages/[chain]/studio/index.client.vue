<script setup lang="ts">
import { CHAINS } from '@kodadot1/static'
import { useCreatorDashboard } from '~/composables/dashboard/useCreatorDashboard'

definePageMeta({
  layout: 'no-footer',
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && chain in CHAINS
  },
})

const { isLogIn } = useAuth()
const route = useRoute()
const router = useRouter()

const isMock = computed(() => route.query.mock === 'true')
const { collections, isLoading, hasCollections } = useCreatorDashboard()

watch(isLogIn, (loggedIn) => {
  if (!loggedIn && !isMock.value) {
    router.push('/')
  }
}, { immediate: true })

useSeoMeta({
  title: 'My Collections — Studio',
})
</script>

<template>
  <UContainer class="px-4 md:px-6 py-8">
    <!-- Mock mode indicator -->
    <div v-if="isMock" class="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 mb-4 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
      <UIcon name="i-heroicons-beaker" class="w-4 h-4 shrink-0" />
      <span>Mock mode — showing sample collections without a connected wallet.</span>
    </div>

    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold">
        My Collections
      </h1>
      <UButton
        icon="i-heroicons-plus"
        to="/create/collection"
      >
        Create Collection
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="i in 4"
        :key="i"
        class="border border-border rounded-xl overflow-hidden"
      >
        <USkeleton class="h-32 w-full" />
        <div class="p-4 space-y-3">
          <USkeleton class="h-4 w-3/4 rounded" />
          <USkeleton class="h-3 w-1/2 rounded" />
          <div class="flex gap-2">
            <USkeleton class="h-8 flex-1 rounded" />
            <USkeleton class="h-8 flex-1 rounded" />
          </div>
        </div>
      </div>
    </div>

    <!-- Collections grid -->
    <div v-else-if="hasCollections" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <DashboardCollectionCard
        v-for="collection in collections"
        :key="collection.id"
        :collection="collection"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-20">
      <UIcon name="i-heroicons-rectangle-stack" class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
      <h2 class="text-xl font-semibold mb-2">
        You don't have any collections yet
      </h2>
      <p class="text-muted-foreground mb-6">
        Create your first collection to start minting NFTs.
      </p>
      <UButton
        size="lg"
        icon="i-heroicons-plus"
        to="/create/collection"
      >
        Create your first collection
      </UButton>
    </div>
  </UContainer>
</template>
