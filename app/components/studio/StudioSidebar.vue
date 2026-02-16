<script setup lang="ts">
import type { StudioCollectionData } from '~/composables/studio/useStudioCollection'

defineProps<{
  collection: StudioCollectionData
}>()

const route = useRoute()
const router = useRouter()
const store = useBulkOperationsStore()

const isCollapsed = ref(false)
const showNavWarning = ref(false)
let pendingNavTarget: string | null = null

const queryString = computed(() => {
  const q = new URLSearchParams(route.query as Record<string, string>).toString()
  return q ? `?${q}` : ''
})

const navLinks = computed(() => [
  {
    label: 'Preview',
    icon: 'i-heroicons-eye',
    to: `/${route.params.chain}/studio/${route.params.collection_id}/preview${queryString.value}`,
  },
  {
    label: 'Details',
    icon: 'i-heroicons-cog-6-tooth',
    to: `/${route.params.chain}/studio/${route.params.collection_id}/details${queryString.value}`,
  },
  {
    label: 'Items',
    icon: 'i-heroicons-squares-2x2',
    to: `/${route.params.chain}/studio/${route.params.collection_id}${queryString.value}`,
  },
])

const massMintLink = computed(() =>
  `/${route.params.chain}/studio/${route.params.collection_id}/massmint${queryString.value}`,
)

const viewCollectionLink = computed(() =>
  `/${route.params.chain}/collection/${route.params.collection_id}${queryString.value}`,
)

function isActive(to: string) {
  const path = to.split('?')[0]!
  const studioBase = `/${route.params.chain}/studio/${route.params.collection_id}`
  // For Items (index), exact match only
  if (path === studioBase) {
    return route.path === path
  }
  return route.path.startsWith(path)
}

function handleNavClick(to: string) {
  if (store.isActive) {
    pendingNavTarget = to
    showNavWarning.value = true
    return
  }
  router.push(to)
}

function confirmNavWarning() {
  showNavWarning.value = false
  store.reset()
  if (pendingNavTarget) {
    router.push(pendingNavTarget)
    pendingNavTarget = null
  }
}

function cancelNavWarning() {
  showNavWarning.value = false
  pendingNavTarget = null
}

function handleDeleteCollection() {
  // placeholder
}

// Responsive collapse
function updateCollapsed() {
  isCollapsed.value = window.innerWidth < 1024
}

onMounted(() => {
  updateCollapsed()
  window.addEventListener('resize', updateCollapsed)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCollapsed)
})
</script>

<template>
  <aside
    class="h-full sticky top-0 flex flex-col border-r border-border bg-muted/30 shrink-0 transition-[width] duration-200"
    :class="isCollapsed ? 'w-16' : 'w-56'"
  >
    <!-- Collection Identity -->
    <div class="p-3 border-b border-border">
      <div class="flex items-center gap-3" :class="{ 'justify-center': isCollapsed }">
        <div class="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
          <img
            v-if="collection.image"
            :src="sanitizeIpfsUrl(collection.image)"
            :alt="collection.name"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-heroicons-photo" class="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        <div v-if="!isCollapsed" class="flex-1 min-w-0">
          <h3 class="font-semibold text-sm truncate">
            {{ collection.name }}
          </h3>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span class="font-mono">{{ collection.claimed }} items</span>
            <UBadge :label="collection.chain" size="xs" variant="subtle" class="font-mono" />
          </div>
        </div>
      </div>
    </div>

    <!-- Nav Links -->
    <nav class="flex-1 p-2 space-y-1">
      <button
        v-for="link in navLinks"
        :key="link.to"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="[
          isActive(link.to)
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          isCollapsed ? 'justify-center' : '',
        ]"
        @click="handleNavClick(link.to)"
      >
        <UIcon :name="link.icon" class="w-5 h-5 shrink-0" />
        <span v-if="!isCollapsed">{{ link.label }}</span>
      </button>

      <!-- Mass Mint Button -->
      <div class="pt-2">
        <UButton
          icon="i-heroicons-sparkles"
          color="primary"
          :class="isCollapsed ? 'w-full justify-center' : 'w-full'"
          @click="handleNavClick(massMintLink)"
        >
          <span v-if="!isCollapsed">Mass Mint</span>
        </UButton>
      </div>
    </nav>

    <!-- Bottom Actions -->
    <div class="p-2 border-t border-border space-y-1">
      <!-- View Collection -->
      <a
        :href="viewCollectionLink"
        target="_blank"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        :class="isCollapsed ? 'justify-center' : ''"
      >
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-5 h-5 shrink-0" />
        <span v-if="!isCollapsed">View Collection</span>
      </a>

      <!-- Delete Collection -->
      <button
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
        :class="isCollapsed ? 'justify-center' : ''"
        @click="handleDeleteCollection"
      >
        <UIcon name="i-heroicons-trash" class="w-5 h-5 shrink-0" />
        <span v-if="!isCollapsed">Delete Collection</span>
      </button>
    </div>
  </aside>

  <!-- Nav Warning Dialog -->
  <UModal v-model:open="showNavWarning">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">
          Leave current operation?
        </h3>
        <p class="text-muted-foreground">
          You have an active operation in progress. Leaving will discard your progress.
        </p>
        <div class="flex justify-end gap-3">
          <UButton variant="outline" @click="cancelNavWarning">
            Stay
          </UButton>
          <UButton color="error" @click="confirmNavWarning">
            Leave
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
